package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/amanzanero/wordleboard/config"
	"github.com/amanzanero/wordleboard/mongo"
	"github.com/amanzanero/wordleboard/users"
	"github.com/amanzanero/wordleboard/wordle"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/amanzanero/wordleboard/graph"
	"github.com/amanzanero/wordleboard/graph/generated"
	log "github.com/sirupsen/logrus"
)

func main() {
	isDev := flag.Bool("dev", false, "run in development mode")
	flag.Parse()

	var logFormat log.Formatter
	if *isDev {
		logFormat = &log.TextFormatter{
			FullTimestamp: true,
		}
	} else {
		logFormat = &log.JSONFormatter{}
	}
	log.SetOutput(os.Stdout)
	logger := &log.Logger{
		Out:          os.Stderr,
		Formatter:    logFormat,
		Hooks:        make(log.LevelHooks),
		Level:        log.DebugLevel,
		ExitFunc:     os.Exit,
		ReportCaller: false,
	}

	mongoService, err := mongo.NewMongoService(config.MongoUri)
	if err != nil {
		panic(err)
	} else {
		logger.Info("connected to mongo")
	}

	// decode firebase credentials
	credentialsBytes, credentialsErr := base64.StdEncoding.DecodeString(config.FirebaseCredentials)
	if err != nil {
		logger.Fatalf("firebase credentials error: %v", credentialsErr)
	}
	authClient, authClientErr := users.NewAuthClient(context.Background(), credentialsBytes)
	if authClientErr != nil {
		logger.Fatalf("failed to initialized auth.Client: %v", authClientErr)
	}
	userService := users.Service{Client: authClient, Repo: mongoService, Logger: logger}
	resolver := &graph.Resolver{
		WordleService: wordle.NewService(
			mongoService,
			logger,
		),
		UsersService: userService,
		Logger:       logger,
	}
	gqlServer := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(Logger(logger))
	r.Handle("/graphql", userService.AuthMiddleware(gqlServer))

	if *isDev {
		r.Get("/development/token/{uid}", userService.CustomTokenRoute(config.FirebaseEndpoint))
		r.Handle("/graphiql", playground.Handler("GraphQL playground", "/graphql"))
	} else {
		r.Handle("/*", http.FileServer(http.Dir("./client/dist")))
	}

	httpServer := &http.Server{
		Addr:    fmt.Sprintf(":%s", config.Port),
		Handler: r,
	}
	httpServer.RegisterOnShutdown(func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
		disconnectErr := mongoService.Disconnect(ctx)
		if disconnectErr != nil {
			logger.Error(disconnectErr)
		} else {
			logger.Info("mongo disconnected")
		}
	})

	srvClosed := make(chan bool)
	go func() {
		err := httpServer.ListenAndServe()
		if err != http.ErrServerClosed {
			logger.Errorf("server failed to start: %v", err)
			return
		}
	}()
	logger.Infof("running on port %s", config.Port)

	interrupted := make(chan os.Signal)
	signal.Notify(interrupted, syscall.SIGTERM, os.Interrupt)

	select {
	case <-interrupted:
		logger.Info("server shutting down gracefully...")
	case <-srvClosed:
		break
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Errorf("there was an error while shutting down: %v", err)
	} else {
		logger.Info("server shut down successfully")
	}
}
