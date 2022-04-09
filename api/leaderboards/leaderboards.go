package leaderboards

import (
	"context"
	"github.com/amanzanero/wordleboard/api/models"
	"github.com/lithammer/shortuuid/v4"
	"github.com/sirupsen/logrus"
	"sort"
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
		if _, isNotFound := findErr.(models.ErrNotFound); isNotFound {
			return models.LeaderboardResultError{Error: models.LeaderboardErrorDoesNotExist}, nil
		} else {
			return nil, models.ErrRepoFailed{RepoMethod: "JoinLeaderboard", Message: findErr.Error()}
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

func (s *Service) RemoveUserFromLeaderboard(ctx context.Context, userId, boardId string) error {
	board, findErr := s.Repo.FindLeaderboardByJoinId(ctx, boardId)
	if findErr != nil {
		if _, isNotFound := findErr.(models.ErrNotFound); isNotFound {
			return nil
		} else {
			return models.ErrRepoFailed{RepoMethod: "RemoveUserFromLeaderboard", Message: findErr.Error()}
		}
	}

	newMembersArray := make([]string, 0)
	for _, member := range board.MemberIds {
		if member != userId {
			newMembersArray = append(newMembersArray, member)
		}
	}
	board.MemberIds = newMembersArray
	err := s.Repo.UpdateLeaderboardById(ctx, board.StoredId, *board)
	if err != nil {
		return models.ErrRepoFailed{
			Message:    err.Error(),
			RepoMethod: "RemoveUserFromLeaderboard",
		}
	}
	return nil
}

func (s *Service) GetLeaderboard(ctx context.Context, userId, boardId string) (models.LeaderboardResult, error) {
	board, findErr := s.Repo.FindLeaderboardByJoinId(ctx, boardId)
	if findErr != nil {
		if _, isNotFound := findErr.(models.ErrNotFound); isNotFound {
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
		return nil, models.ErrRepoFailed{RepoMethod: "JoinLeaderboard", Message: err.Error()}
	}

	dayToStat := make(map[int]models.LeaderboardStat)
	for _, stats := range userStats {
		for _, stat := range stats {
			if entry, ok := dayToStat[stat.Day]; !ok {
				newLeaderboardStat := models.LeaderboardStat{
					Day:   stat.Day,
					Stats: make([]models.UserStat, 1),
				}
				newLeaderboardStat.Stats[0] = stat
				dayToStat[stat.Day] = newLeaderboardStat
			} else {
				entry.Stats = append(entry.Stats, stat)
				dayToStat[stat.Day] = entry
			}
		}
	}

	lbStats := make([]models.LeaderboardStat, len(dayToStat))
	i := 0
	for _, lbStat := range dayToStat {
		lbStats[i] = lbStat
		i += 1
	}

	// pointerize
	returnStats := make([]*models.LeaderboardStat, len(lbStats))
	for i := 0; i < len(returnStats); i += 1 {
		returnStats[i] = &lbStats[i]
	}

	sort.Slice(returnStats, func(i, j int) bool {
		return returnStats[i].Day > returnStats[j].Day
	})

	return returnStats, err
}

func (s *Service) GetLeaderboardsForUser(ctx context.Context, user models.User) ([]*models.Leaderboard, error) {
	return s.Repo.FindLeaderboardsForUser(ctx, user.ID)
}

func (s *Service) GetStatsForUser(ctx context.Context, user models.User) ([]*models.UserStat, error) {
	gameBoards, err := s.Repo.FindGameBoardsForUser(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	stats := make([]*models.UserStat, len(gameBoards))
	for i, gb := range gameBoards {
		stats[i] = &models.UserStat{
			Day:     gb.Day,
			Guesses: gb.Guesses,
			State:   gb.State,
			User:    user,
		}
	}

	return stats, nil
}
