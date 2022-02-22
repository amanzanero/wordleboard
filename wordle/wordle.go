package wordle

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/models"
	"github.com/sirupsen/logrus"
	"sync"
	"time"
)

var (
	day1     *time.Time // June 19, 2021
	day1Once sync.Once
)

type Service struct {
	logger *logrus.Logger
	repo   models.GameBoardRepo
}

func NewService(
	repo models.GameBoardRepo,
	logger *logrus.Logger,
) Service {
	return Service{
		repo:   repo,
		logger: logger,
	}
}

func (s *Service) GetTodayGameOrCreateNewGame(ctx context.Context, user models.User, t time.Time) (*models.GameBoard, error) {
	// find today's if it already exists
	day := timeToWordleDay(t)
	board, lookupErr := s.repo.FindGameBoardByUserAndDay(ctx, user.ID, day)
	if lookupErr == nil {
		return board, nil
	} else if !errors.Is(lookupErr, models.ErrNotFound) {
		s.logger.Error(lookupErr)
		return nil, lookupErr
	}

	// if none exists make a new board
	gameBoard := models.GameBoard{
		Day:     day,
		Guesses: make([]*models.GuessState, 0),
		State:   models.GameStateInProgress,
		UserId:  user.ID,
	}
	insertErr := s.repo.InsertGameBoard(ctx, gameBoard)
	if insertErr != nil {
		return nil, errors.New("internal error")
	}

	return &gameBoard, nil
}

func (s *Service) GetGameByDay(ctx context.Context, userId string, day int) (*models.GameBoard, error) {
	// find today's if it already exists
	board, lookupErr := s.repo.FindGameBoardByUserAndDay(ctx, userId, day)
	if lookupErr != nil {
		s.logger.Error(lookupErr)
		return nil, lookupErr
	}
	return board, nil
}

func Guess(gameBoard models.GameBoard, guess string) (*models.GameBoard, error) {
	return nil, nil
}

func timeToWordleDay(t time.Time) int {
	day1Once.Do(func() {
		_t := time.Unix(1624086000, 0).UTC()
		day1 = &_t
	})

	diff := int(t.UTC().Sub(*day1).Hours()) / 24
	return diff
}
