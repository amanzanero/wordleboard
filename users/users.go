package users

import (
	"context"
	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/amanzanero/wordleboard/models"
	"github.com/sirupsen/logrus"
	"google.golang.org/api/option"
)

type Service struct {
	Repo   models.UserRepo
	Client *auth.Client
	Logger *logrus.Logger
}

func NewAuthClient(ctx context.Context, firebaseCredentials []byte) (*auth.Client, error) {
	opt := option.WithCredentialsJSON(firebaseCredentials)
	app, appErr := firebase.NewApp(ctx, nil, opt)
	if appErr != nil {
		return nil, appErr
	}
	return app.Auth(ctx)
}

func (s *Service) GetUserForAuthToken(token string) (*models.User, error) {
	panic("TODO")
}

func (s *Service) GetUserById(ctx context.Context, id string) (*models.User, error) {
	return s.Repo.FindUserById(ctx, id)
}

func (s *Service) GetUserByOauthUuid(ctx context.Context, id string) (*models.User, error) {
	return s.Repo.FindUserByUuid(ctx, id)
}

func (s *Service) CreateNewUser(ctx context.Context, user models.NewUser) (models.NewUserResult, error) {
	// auth shit here
	return nil, nil
}
