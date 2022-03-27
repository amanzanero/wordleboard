package models

import (
	"context"
	"fmt"
	"io"
	"strconv"
)

type LeaderboardRepo interface {
	FindLeaderboardByJoinId(ctx context.Context, joinId string) (*Leaderboard, error)
	InsertNewLeaderboard(ctx context.Context, owner Leaderboard) (*Leaderboard, error)
	UpdateLeaderboardById(ctx context.Context, id string, leaderboard Leaderboard) error
	FindLeaderBoardMembers(ctx context.Context, members []string) ([]*User, error)
	FindLeaderboardStatsForMembers(ctx context.Context, members []string) (map[User][]UserStat, error)
	FindLeaderboardsForUser(ctx context.Context, userId string) ([]*Leaderboard, error)
	FindGameBoardsForUser(ctx context.Context, userId string) ([]*GameBoard, error)
}

type Leaderboard struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	MemberIds []string
	StoredId  string
	Owner     string `json:"owner"`
}

type LeaderboardStat struct {
	Day   int         `json:"day"`
	Stats []*UserStat `json:"stats"`
}

type UserStat struct {
	Day     int            `json:"day"`
	Guesses [][]GuessState `json:"guessCount"`
	State   GameState      `json:"gameState"`
	User    User           `json:"user"`
}

type LeaderboardResult interface {
	IsLeaderboardResult()
}

func (Leaderboard) IsLeaderboardResult() {}

type LeaderboardResultError struct {
	Error LeaderboardError `json:"error"`
}

func (LeaderboardResultError) IsLeaderboardResult() {}

type LeaderboardError string

const (
	LeaderboardErrorDoesNotExist   LeaderboardError = "DoesNotExist"
	LeaderboardErrorMaxCapacity    LeaderboardError = "MaxCapacity"
	LeaderboardErrorCouldNotCreate LeaderboardError = "CouldNotCreate"
	LeaderboardErrorNotAuthorized  LeaderboardError = "NotAuthorized"
)

var AllLeaderboardError = []LeaderboardError{
	LeaderboardErrorDoesNotExist,
	LeaderboardErrorMaxCapacity,
	LeaderboardErrorCouldNotCreate,
	LeaderboardErrorNotAuthorized,
}

func (e LeaderboardError) IsValid() bool {
	switch e {
	case LeaderboardErrorDoesNotExist,
		LeaderboardErrorMaxCapacity,
		LeaderboardErrorCouldNotCreate,
		LeaderboardErrorNotAuthorized:
		return true
	}
	return false
}

func (e LeaderboardError) String() string {
	return string(e)
}

func (e *LeaderboardError) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = LeaderboardError(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid LeaderboardError", str)
	}
	return nil
}

func (e LeaderboardError) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
