package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"time"

	"github.com/amanzanero/wordleboard/graph/generated"
	"github.com/amanzanero/wordleboard/models"
)

func (r *leaderboardResolver) Members(ctx context.Context, obj *models.Leaderboard) ([]*models.User, error) {
	return []*models.User{{DisplayName: ""}}, nil
}

func (r *leaderboardResolver) Stats(ctx context.Context, obj *models.Leaderboard) ([]*models.LeaderboardStat, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) Guess(ctx context.Context, input string) (models.GuessResult, error) {
	board, err := r.WordleService.Guess(ctx, FakeUser.ID, input)
	if err != nil {
		r.Logger.Error("guess mutation failed", err)
		return nil, err
	}
	return board, nil
}

func (r *mutationResolver) CreateLeaderboard(ctx context.Context, input string) (*models.Leaderboard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Day(ctx context.Context, input int) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()
	return r.WordleService.GetGameByDay(cancelCtx, FakeUser.ID, input)
}

func (r *queryResolver) TodayBoard(ctx context.Context) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, time.Second*30)
	defer cancel()
	return r.WordleService.GetTodayGameOrCreateNewGame(cancelCtx, FakeUser, time.Now())
}

func (r *queryResolver) User(ctx context.Context, input string) (*models.User, error) {
	panic(fmt.Errorf("not implemented"))
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

type leaderboardResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
type userStatResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//  - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//    it when you're done.
//  - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *gameBoardResolver) User(ctx context.Context, obj *models.GameBoard) (*models.User, error) {
	return r.UsersService.GetUserById(obj.UserId)
}
func (r *Resolver) GameBoard() generated.GameBoardResolver { return &gameBoardResolver{r} }

type gameBoardResolver struct{ *Resolver }

var FakeUser = models.User{
	ID:          "62141fefd1a861b9671c10ee",
	DisplayName: "",
	OauthId:     "",
}
