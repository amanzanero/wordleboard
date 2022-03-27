package graph

import (
	"github.com/amanzanero/wordleboard/api/leaderboards"
	"github.com/amanzanero/wordleboard/api/users"
	"github.com/amanzanero/wordleboard/api/wordle"
	"github.com/sirupsen/logrus"
	"time"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	WordleService      wordle.Service
	UsersService       users.Service
	LeaderboardService leaderboards.Service
	Logger             *logrus.Logger
	Timeout            time.Duration
}
