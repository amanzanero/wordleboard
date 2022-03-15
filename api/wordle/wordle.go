package wordle

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"github.com/sirupsen/logrus"
	"strings"
	"sync"
	"time"
)

var (
	day1     time.Time // June 19, 2021
	day1Once sync.Once

	guesses       map[string]bool
	solutions     []string
	solutionsOnce sync.Once
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

func (s *Service) GetTodayGameOrCreateNewGame(ctx context.Context, userId string, t time.Time) (*models.GameBoard, error) {
	// find today's if it already exists
	day := timeToWordleDay(t)
	board, lookupErr := s.repo.FindGameBoardByUserAndDay(ctx, userId, day)
	if lookupErr == nil {
		return board, nil
	} else if !errors.Is(lookupErr, models.ErrNotFound) {
		s.logger.Error(lookupErr)
		return nil, lookupErr
	}

	// if none exists make a new board
	gameBoard := models.GameBoard{
		Day:     day,
		Guesses: make([][]models.GuessState, 0),
		State:   models.GameStateInProgress,
		UserId:  userId,
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

func (s *Service) Guess(ctx context.Context, userId, guess string) (models.GuessResult, error) {
	solutionsOnce.Do(func() {
		_guesses, err := loadGuesses()
		if err != nil {
			panic(err)
		}
		guesses = _guesses

		_solutions, err := loadSolutions()
		if err != nil {
			panic(err)
		}
		solutions = _solutions
	})

	// today's board
	today := timeToWordleDay(time.Now())
	gameBoard, lookupErr := s.repo.FindGameBoardByUserAndDay(ctx, userId, today)
	if lookupErr != nil {
		s.logger.Warn(lookupErr)
		return nil, lookupErr
	}

	// is game done?
	if gameBoard.State != models.GameStateInProgress {
		return gameBoard, nil
	}

	// see if guess is valid
	if len(guess) != 5 {
		return models.InvalidGuess{Error: models.GuessErrorInvalidLength}, nil
	}

	// is this a word?
	if _, ok := guesses[guess]; ok {
		solution := solutions[today]
		newGuess := make([]models.GuessState, 5)
		flattenedGuesses := flattenGuesses(gameBoard.Guesses, solution)
		won := true
		for i, l := range guess {
			letter := string(l)
			newGuess[i].Letter = string(l)
			inWord := strings.Contains(solution, letter)

			if letter == string(solution[i]) {
				newGuess[i].Guess = models.LetterGuessInLocation
				flattenedGuesses[i].correct = true
			} else if inWord && hasRemainingLetter(flattenedGuesses, letter) {
				won = false
				newGuess[i].Guess = models.LetterGuessInWord
			} else {
				won = false
				newGuess[i].Guess = models.LetterGuessIncorrect
			}
		}
		gameBoard.Guesses = append(gameBoard.Guesses, newGuess)

		// evaluate winning state
		if won {
			gameBoard.State = models.GameStateWon
		} else if len(gameBoard.Guesses) == 6 {
			gameBoard.State = models.GameStateLost
		}
		updateErr := s.repo.UpdateGameBoardById(ctx, gameBoard.ID, *gameBoard)
		if updateErr != nil {
			return nil, updateErr
		}
		return gameBoard, nil
	} else {
		return models.InvalidGuess{Error: models.GuessErrorNotAWord}, nil
	}
}

type guessAtLocation struct {
	letter  string
	correct bool
}

// flattenGuesses creates a list showing which letters have been guessed correctly so far
func flattenGuesses(guesses [][]models.GuessState, solution string) []guessAtLocation {
	flattened := make([]guessAtLocation, 5)
	for i, letter := range strings.Split(solution, "") {
		flattened[i].letter = letter
	}

	for _, row := range guesses {
		for i, guess := range row {
			if guess.Guess == models.LetterGuessInLocation {
				flattened[i].correct = true
			}
		}
	}
	return flattened
}

func hasRemainingLetter(guesses []guessAtLocation, letter string) bool {
	for _, guess := range guesses {
		if letter == guess.letter && !guess.correct {
			return true
		}
	}
	return false
}

func timeToWordleDay(t time.Time) int {
	day1Once.Do(func() {
		day1 = time.Unix(1624086000, 0).UTC() // June 19, 2021 12AM PST
	})

	diff := int(t.UTC().Sub(day1).Hours()) / 24
	return diff
}
