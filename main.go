package main

import (
	"context"
	"flag"
	"github.com/99designs/gqlgen/graphql/playground"
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

	logFormat := &log.TextFormatter{
		FullTimestamp: true,
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

	mongoService, err := mongo.NewMongoService("mongodb://root:rootpassword@localhost:27017")
	if err != nil {
		panic(err)
	} else {
		logger.Info("connected to mongo")
	}
	resolver := &graph.Resolver{
		WordleService: wordle.NewService(
			mongoService,
			logger,
		),
		UsersService: users.Service{},
	}
	gqlServer := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(Logger("api", logger))
	r.Handle("/graphql", gqlServer)

	if *isDev {
		r.Handle("/graphiql", playground.Handler("GraphQL playground", "/graphql"))
		r.Handle("/*", http.FileServer(http.Dir("./client/dist")))
	}

	httpServer := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}
	httpServer.RegisterOnShutdown(func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()
		err := mongoService.Disconnect(ctx)
		if err != nil {
			logger.Error(err)
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
	logger.Info("running on port 8080")

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
