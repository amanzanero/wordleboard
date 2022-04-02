package mongo

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type persistedUser struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	DisplayName string               `bson:"display_name"`
	OauthUuid   string               `bson:"oauth_uuid"`
	GameBoards  []persistedGameBoard `bson:"game_boards"`
}

func persistedUserToModel(pu persistedUser) models.User {
	return models.User{
		ID:          pu.ID.Hex(),
		DisplayName: pu.DisplayName,
		OauthId:     pu.OauthUuid,
	}
}

func (s *Service) FindUserById(ctx context.Context, userId string) (*models.User, error) {
	col := s.database.Collection("users")
	doc := col.FindOne(ctx, bson.M{"_id": userId})
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound{Message: doc.Err().Error(), RepoMethod: "FindUserById"}
		}
		return nil, models.ErrRepoFailed{Message: doc.Err().Error(), RepoMethod: "FindUserById"}
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindUserById"}
	}

	model := persistedUserToModel(*pUser)
	return &model, nil
}

func (s *Service) FindUserByUuid(ctx context.Context, oauthUuid string) (*models.User, error) {
	col := s.database.Collection("users")
	opt := options.FindOne().SetProjection(bson.M{"game_boards": 0})
	doc := col.FindOne(ctx, bson.M{"oauth_uuid": oauthUuid}, opt)
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound{Message: doc.Err().Error(), RepoMethod: "FindUserByUuid"}
		}
		return nil, models.ErrRepoFailed{Message: doc.Err().Error(), RepoMethod: "FindUserByUuid"}
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindUserByUuid"}
	}
	model := persistedUserToModel(*pUser)
	return &model, nil
}

func (s *Service) InsertUser(ctx context.Context, user models.NewUser) (*models.User, error) {
	col := s.database.Collection("users")
	persist := &persistedUser{
		DisplayName: user.DisplayName,
		OauthUuid:   user.ID,
		GameBoards:  make([]persistedGameBoard, 0),
	}
	result, err := col.InsertOne(ctx, persist)
	if err != nil {
		return nil, models.ErrRepoFailed{
			Message:    err.Error(),
			RepoMethod: "InsertUser",
		}
	}
	return &models.User{
		ID:          result.InsertedID.(primitive.ObjectID).Hex(),
		DisplayName: user.DisplayName,
		OauthId:     user.ID,
	}, nil
}
