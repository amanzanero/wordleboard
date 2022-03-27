package leaderboards

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"github.com/lithammer/shortuuid/v4"
	"github.com/sirupsen/logrus"
)

type Service struct {
	Logger *logrus.Logger
	Repo   models.LeaderboardRepo
}

func (s *Service) CreateNewLeaderboard(ctx context.Context, owner, name string) (models.LeaderboardResult, error) {
	modelToInsert := models.Leaderboard{
		Name:      name,
		MemberIds: make([]string, 1),
		Owner:     owner,
		ID:        shortuuid.New(),
	}
	modelToInsert.MemberIds[0] = owner
	lb, err := s.Repo.InsertNewLeaderboard(ctx, modelToInsert)
	if err != nil {
		return models.LeaderboardResultError{Error: models.LeaderboardErrorCouldNotCreate}, nil
	}
	return lb, nil
}

func (s *Service) JoinLeaderboard(ctx context.Context, userId, boardId string) (models.LeaderboardResult, error) {
	board, findErr := s.Repo.FindLeaderboardByJoinId(ctx, boardId)
	if findErr != nil {
		if errors.Is(findErr, models.ErrNotFound) {
			return models.LeaderboardResultError{Error: models.LeaderboardErrorDoesNotExist}, nil
		} else {
			return nil, findErr
		}
	}

	isAlreadyInBoard := false
	for _, member := range board.MemberIds {
		if userId == member {
			isAlreadyInBoard = true
			break
		}
	}

	if isAlreadyInBoard || board.Owner == userId {
		return board, nil
	}

	board.MemberIds = append(board.MemberIds, userId)
	saveErr := s.Repo.UpdateLeaderboardById(ctx, board.StoredId, *board)
	if saveErr != nil {
		return nil, saveErr
	}
	return board, nil
}

func (s *Service) GetLeaderboard(ctx context.Context, userId, boardId string) (models.LeaderboardResult, error) {
	board, findErr := s.Repo.FindLeaderboardByJoinId(ctx, boardId)
	if findErr != nil {
		if errors.Is(findErr, models.ErrNotFound) {
			return models.LeaderboardResultError{Error: models.LeaderboardErrorDoesNotExist}, nil
		} else {
			return nil, findErr
		}
	}

	// user must own or be in the leaderboard to have access
	userIsOwner := board.Owner == userId
	userIsMember := false
	for _, member := range board.MemberIds {
		if member == userId {
			userIsMember = true
			break
		}
	}

	if userIsOwner || userIsMember {
		return board, nil
	}
	return models.LeaderboardResultError{Error: models.LeaderboardErrorNotAuthorized}, nil
}

func (s *Service) GetStatsForLeaderboard(ctx context.Context, lb models.Leaderboard) ([]*models.LeaderboardStat, error) {
	userStats, err := s.Repo.FindLeaderboardStatsForMembers(ctx, lb.MemberIds)
	if err != nil {
		return nil, models.ErrRepoFailed
	}

	dayToStat := make(map[int]models.LeaderboardStat)
	for _, stats := range userStats {
		for _, stat := range stats {
			if entry, ok := dayToStat[stat.Day]; !ok {
				newLeaderboardStat := models.LeaderboardStat{
					Day:   stat.Day,
					Stats: make([]*models.UserStat, 1),
				}
				newLeaderboardStat.Stats[0] = &stat
				dayToStat[stat.Day] = newLeaderboardStat
			} else {
				entry.Stats = append(entry.Stats, &stat)
				dayToStat[stat.Day] = entry
			}
		}
	}

	lbStats := make([]*models.LeaderboardStat, len(dayToStat))
	i := 0
	for _, lbStat := range dayToStat {
		lbStats[i] = &lbStat
		i += 1
	}

	return lbStats, err
}
