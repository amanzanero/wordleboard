package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/amanzanero/wordleboard/graph/generated"
	"github.com/amanzanero/wordleboard/models"
)

func (r *leaderboardResolver) Members(ctx context.Context, obj *models.Leaderboard) ([]*models.User, error) {
	return []*models.User{{DisplayName: ""}}, nil
}

func (r *leaderboardResolver) Stats(ctx context.Context, obj *models.Leaderboard) ([]*models.LeaderboardStat, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) Guess(ctx context.Context, input string) (*models.GameBoard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateLeaderboard(ctx context.Context, input string) (*models.Leaderboard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Day(ctx context.Context, input int) (*models.GameBoard, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) TodayBoard(ctx context.Context) (*models.GameBoard, error) {
	panic(fmt.Errorf("not implemented"))
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
