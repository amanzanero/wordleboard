package mongo

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type persistedUser struct {
	ID          string `bson:"_id"`
	DisplayName string `bson:"display_name"`
	OauthUuid   string `bson:"oauth_uuid"`
}

func (s *Service) FindUserById(ctx context.Context, userId string) (*models.User, error) {
	col := s.database.Collection("users")
	doc := col.FindOne(ctx, bson.M{"_id": userId})
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound
		}
		return nil, models.ErrRepoFailed
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		return nil, models.ErrRepoFailed
	}

	return &models.User{
		ID:          pUser.ID,
		DisplayName: pUser.DisplayName,
		OauthId:     pUser.OauthUuid,
	}, nil
}

func (s *Service) FindUserByUuid(ctx context.Context, oauthUuid string) (*models.User, error) {
	col := s.database.Collection("users")
	doc := col.FindOne(ctx, bson.M{"oauth_uuid": oauthUuid})
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound
		}
		return nil, models.ErrRepoFailed
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		return nil, models.ErrRepoFailed
	}

	return &models.User{
		ID:          pUser.ID,
		DisplayName: pUser.DisplayName,
		OauthId:     pUser.OauthUuid,
	}, nil
}

func (s *Service) CreateUser(ctx context.Context, user models.NewUser) (*models.User, error) {
	//TODO implement me
	panic("implement me")
}
