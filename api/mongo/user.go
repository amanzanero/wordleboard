package mongo

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type persistedUser struct {
	ID          string `bson:"_id,omitempty"`
	DisplayName string `bson:"display_name"`
	OauthUuid   string `bson:"oauth_uuid"`
}

func (s *Service) FindUserById(ctx context.Context, userId string) (*models.User, error) {
	col := s.database.Collection("users")
	doc := col.FindOne(ctx, bson.M{"_id": userId})
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			s.logger.Warnf("FindUserById: %v", doc.Err())
			return nil, models.ErrNotFound
		}
		s.logger.Errorf("FindUserById mongodb err: %v", doc.Err())
		return nil, models.ErrRepoFailed
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		s.logger.Errorf("FindUserById decode err: %v", err)
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
			s.logger.Warnf("FindUserByUuid: %v", doc.Err())
			return nil, models.ErrNotFound
		}
		s.logger.Errorf("FindUserByUuid: %v", doc.Err())
		return nil, models.ErrRepoFailed
	}

	pUser := new(persistedUser)
	err := doc.Decode(pUser)
	if err != nil {
		s.logger.Errorf("FindUserByUuid: %v", err)
		return nil, models.ErrRepoFailed
	}

	return &models.User{
		ID:          pUser.ID,
		DisplayName: pUser.DisplayName,
		OauthId:     pUser.OauthUuid,
	}, nil
}

func (s *Service) InsertUser(ctx context.Context, user models.NewUser) error {
	col := s.database.Collection("users")
	persist := &persistedUser{
		DisplayName: user.DisplayName,
		OauthUuid:   user.ID,
	}
	_, err := col.InsertOne(ctx, persist)
	if err != nil {
		s.logger.Warnf("InsertUser: %v", err)
		return err
	}
	return nil
}
