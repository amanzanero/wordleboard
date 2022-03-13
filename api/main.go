package main

import (
	"context"
	"flag"
	"fmt"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/amanzanero/wordleboard/api/mongo"
	"github.com/amanzanero/wordleboard/api/secrets"
	"github.com/amanzanero/wordleboard/api/users"
	"github.com/amanzanero/wordleboard/api/wordle"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/amanzanero/wordleboard/api/graph"
	"github.com/amanzanero/wordleboard/api/graph/generated"
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

	secretManager := secrets.NewManager(*isDev, logger)
	secretManager.Initialize()

	logger.Info("connecting to mongodb...")
	mongoService, err := mongo.NewMongoService(secretManager.GetSecretString(secrets.MongoUri), logger)
	if err != nil {
		logger.Fatalf("failed to create mongodb service: %v", err)
	} else {
		logger.Info("connected to mongodb")
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
		disconnectErr := mongoService.Disconnect(ctx)
		if disconnectErr != nil {
			logger.Error(disconnectErr)
		} else {
			logger.Info("disconnected from mongodb")
		}
	}()

	authClient, authClientErr := users.NewAuthClient(context.Background(), secretManager)
	if authClientErr != nil {
		logger.Fatalf("failed to initialize auth.Client: %v", authClientErr)
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
	r.Use(HttpLoggingMiddleware(logger, *isDev))
	r.Handle("/graphql", userService.AuthMiddleware(gqlServer))
	r.Post("/api/users", userService.CreateUserHandler())

	if *isDev {
		r.Get("/api/token/{uid}", userService.AccessToken(secretManager.GetSecretString(secrets.FirebaseEndpoint)))
		r.Get("/api/customToken/{uid}", userService.CustomToken())
		r.Handle("/graphiql", playground.Handler("GraphQL playground", "/graphql"))
	}

	httpServer := &http.Server{
		Addr:    fmt.Sprintf(":%s", secretManager.GetSecretString(secrets.Port)),
		Handler: r,
	}

	srvClosed := make(chan bool)
	go func() {
		err := httpServer.ListenAndServe()
		if err != http.ErrServerClosed {
			logger.Errorf("server failed to start: %v", err)
			srvClosed <- true
		}
	}()
	logger.Infof("http server running on port %s", secretManager.GetSecretString(secrets.Port))

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

	if err = httpServer.Shutdown(ctx); err != nil {
		logger.Fatalf("there was an error while shutting down: %v", err)
	} else {
		logger.Info("http server shutdown successfylly")
	}
}
