package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"github.com/amanzanero/wordleboard/graph/generated"
	"github.com/amanzanero/wordleboard/models"
	"github.com/amanzanero/wordleboard/users"
)

func (r *gameBoardResolver) User(ctx context.Context, obj *models.GameBoard) (*models.User, error) {
	return r.UsersService.GetUserById(ctx, obj.UserId)
}

func (r *leaderboardResolver) Members(ctx context.Context, obj *models.Leaderboard) ([]*models.User, error) {
	return []*models.User{{DisplayName: ""}}, nil
}

func (r *leaderboardResolver) Stats(ctx context.Context, obj *models.Leaderboard) ([]*models.LeaderboardStat, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) Guess(ctx context.Context, input string) (models.GuessResult, error) {
	user := users.ForContext(ctx)
	board, err := r.WordleService.Guess(ctx, user.ID, input)
	if err != nil {
		r.Logger.Errorf("guess mutation failed: %v", err)
		return nil, err
	}
	return board, nil
}

func (r *mutationResolver) CreateLeaderboard(ctx context.Context, input string) (*models.Leaderboard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateUser(ctx context.Context, input models.NewUser) (models.NewUserResult, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Day(ctx context.Context, input int) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()

	user := users.ForContext(ctx)
	return r.WordleService.GetGameByDay(cancelCtx, user.ID, input)
}

func (r *queryResolver) TodayBoard(ctx context.Context) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()

	user := users.ForContext(ctx)
	return r.WordleService.GetTodayGameOrCreateNewGame(cancelCtx, user.ID, time.Now())
}

func (r *queryResolver) Me(ctx context.Context) (*models.User, error) {
	return users.ForContext(ctx), nil
}

func (r *queryResolver) Leaderboard(ctx context.Context, input string) (*models.Leaderboard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *userResolver) Leaderboards(ctx context.Context, obj *models.User) ([]*models.Leaderboard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *userResolver) IndividualStats(ctx context.Context, obj *models.User) ([]*models.UserStat, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *userStatResolver) User(ctx context.Context, obj *models.UserStat) (*models.User, error) {
	panic(fmt.Errorf("not implemented"))
}

// GameBoard returns generated.GameBoardResolver implementation.
func (r *Resolver) GameBoard() generated.GameBoardResolver { return &gameBoardResolver{r} }

// Leaderboard returns generated.LeaderboardResolver implementation.
func (r *Resolver) Leaderboard() generated.LeaderboardResolver { return &leaderboardResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

// UserStat returns generated.UserStatResolver implementation.
func (r *Resolver) UserStat() generated.UserStatResolver { return &userStatResolver{r} }

type gameBoardResolver struct{ *Resolver }
type leaderboardResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
type userStatResolver struct{ *Resolver }
