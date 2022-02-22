package models

type UserRepo interface {
	FindUserById()
}
type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	OauthId     string
}
