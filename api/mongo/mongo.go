package mongo

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

type Service struct {
	database *mongo.Database
	client   *mongo.Client
}

func NewMongoService(connection string) (*Service, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connection))
	if err != nil {
		return nil, err
	}
	return &Service{
			client.Database("wordleboard"),
			client},
		nil
}

func (s *Service) Disconnect(ctx context.Context) error {
	return s.client.Disconnect(ctx)
}
