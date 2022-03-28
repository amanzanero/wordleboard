package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"sync"
	"time"

	"github.com/amanzanero/wordleboard/api/graph/generated"
	"github.com/amanzanero/wordleboard/api/models"
	"github.com/amanzanero/wordleboard/api/users"
)

func (r *leaderboardResolver) Members(ctx context.Context, obj *models.Leaderboard) ([]*models.User, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	return r.LeaderboardService.Repo.FindLeaderBoardMembers(cancelCtx, obj.MemberIds)
}

func (r *leaderboardResolver) Stats(ctx context.Context, obj *models.Leaderboard, first *int, after *int) ([]*models.LeaderboardStat, error) {
	user := users.ForContext(ctx)

	var wg sync.WaitGroup
	var stats []*models.LeaderboardStat
	var statsErr error
	var todayBoard *models.GameBoard
	var todayBoardErr error

	wg.Add(2)
	go func() {
		stats, statsErr = r.LeaderboardService.GetStatsForLeaderboard(ctx, *obj)
		wg.Done()
	}()
	go func() {
		todayBoard, todayBoardErr = r.WordleService.GetTodayGameOrCreateNewGame(ctx, user.ID, time.Now())
		wg.Done()
	}()
	wg.Wait()

	if statsErr != nil {
		return nil, statsErr
	}
	if todayBoardErr != nil {
		return nil, todayBoardErr
	}

	for _, stat := range stats {
		if stat.Day == todayBoard.Day && todayBoard.State == models.GameStateInProgress {
			stat.Visible = false
		} else {
			stat.Visible = true
		}
	}
	return stats, nil
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

func (r *mutationResolver) CreateLeaderboard(ctx context.Context, name string) (models.LeaderboardResult, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	user := users.ForContext(ctx)

	return r.LeaderboardService.CreateNewLeaderboard(cancelCtx, user.ID, name)
}

func (r *mutationResolver) JoinLeaderboard(ctx context.Context, id string) (models.LeaderboardResult, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	user := users.ForContext(ctx)
	return r.LeaderboardService.JoinLeaderboard(cancelCtx, user.ID, id)
}

func (r *queryResolver) Day(ctx context.Context, input int) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	user := users.ForContext(ctx)
	return r.WordleService.GetGameByDay(cancelCtx, user.ID, input)
}

func (r *queryResolver) TodayBoard(ctx context.Context) (*models.GameBoard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	user := users.ForContext(ctx)
	return r.WordleService.GetTodayGameOrCreateNewGame(cancelCtx, user.ID, time.Now())
}

func (r *queryResolver) Me(ctx context.Context) (*models.User, error) {
	return users.ForContext(ctx), nil
}

func (r *queryResolver) Leaderboard(ctx context.Context, joinID string) (models.LeaderboardResult, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()

	user := users.ForContext(ctx)
	return r.LeaderboardService.GetLeaderboard(cancelCtx, user.ID, joinID)
}

func (r *userResolver) Leaderboards(ctx context.Context, obj *models.User) ([]*models.Leaderboard, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()
	return r.LeaderboardService.GetLeaderboardsForUser(cancelCtx, *obj)
}

func (r *userResolver) IndividualStats(ctx context.Context, obj *models.User, first *int, after *int) ([]*models.UserStat, error) {
	cancelCtx, cancel := context.WithTimeout(ctx, r.Timeout)
	defer cancel()
	return r.LeaderboardService.GetStatsForUser(cancelCtx, *obj)
}

// Leaderboard returns generated.LeaderboardResolver implementation.
func (r *Resolver) Leaderboard() generated.LeaderboardResolver { return &leaderboardResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type leaderboardResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
