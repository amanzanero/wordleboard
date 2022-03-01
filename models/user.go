package models

import (
	"context"
	"fmt"
	"io"
	"strconv"
)

type UserRepo interface {
	FindUserById(ctx context.Context, userId string) (*User, error)
	FindUserByUuid(ctx context.Context, oauthUuid string) (*User, error)
	CreateUser(ctx context.Context, user NewUser) (*User, error)
}
type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	OauthId     string
}

type NewUserResult interface {
	IsNewUserResult()
}

type NewUser struct {
	ID          string  `json:"id"`
	Token       string  `json:"token"`
	DisplayName *string `json:"displayName"`
}

type NewUserError struct {
	Error *CreateNewUserError `json:"error"`
}

func (NewUserError) IsNewUserResult() {}

func (User) IsNewUserResult() {}

type CreateNewUserError string

const (
	CreateNewUserErrorUserAlreadyExists  CreateNewUserError = "UserAlreadyExists"
	CreateNewUserErrorInvalidCredentials CreateNewUserError = "InvalidCredentials"
)

var AllCreateNewUserError = []CreateNewUserError{
	CreateNewUserErrorUserAlreadyExists,
	CreateNewUserErrorInvalidCredentials,
}

func (e CreateNewUserError) IsValid() bool {
	switch e {
	case CreateNewUserErrorUserAlreadyExists, CreateNewUserErrorInvalidCredentials:
		return true
	}
	return false
}

func (e CreateNewUserError) String() string {
	return string(e)
}

func (e *CreateNewUserError) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = CreateNewUserError(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid CreateNewUserError", str)
	}
	return nil
}

func (e CreateNewUserError) MarshalGQL(w io.Writer) {
	_, _ = fmt.Fprint(w, strconv.Quote(e.String()))
}
