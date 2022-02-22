package users

import "github.com/amanzanero/wordleboard/models"

type Service struct {
}

func (s *Service) GetUserForAuthToken(token string) (*models.User, error) {
	panic("TODO")
}

func (s *Service) GetUserById(id string) (*models.User, error) {
	panic("TODO")

}
