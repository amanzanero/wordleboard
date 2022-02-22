package graph

import (
	"github.com/amanzanero/wordleboard/users"
	"github.com/amanzanero/wordleboard/wordle"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	WordleService wordle.Service
	UsersService  users.Service
}
