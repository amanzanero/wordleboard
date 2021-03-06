package models

import (
	"context"
	"fmt"
	"io"
	"strconv"
)

type GameBoardRepo interface {
	FindGameBoardByUserAndDay(ctx context.Context, userId string, day int) (*GameBoard, error)
	InsertGameBoard(ctx context.Context, userId string, gameBoard GameBoard) error
	UpdateGameBoardByUserAndDay(ctx context.Context, day int, userId string, gameBoard GameBoard) error
}

type GameBoard struct {
	Day     int            `json:"day"`
	Guesses [][]GuessState `json:"guesses"`
	State   GameState      `json:"state"`
}

type GuessState struct {
	Letter string      `json:"letter"`
	Guess  LetterGuess `json:"guess"`
}

type GameState string

const (
	GameStateInProgress GameState = "IN_PROGRESS"
	GameStateLost       GameState = "LOST"
	GameStateWon        GameState = "WON"
)

var AllGameState = []GameState{
	GameStateInProgress,
	GameStateLost,
	GameStateWon,
}

func (e GameState) IsValid() bool {
	switch e {
	case GameStateInProgress, GameStateLost, GameStateWon:
		return true
	}
	return false
}

func (e GameState) String() string {
	return string(e)
}

func (e *GameState) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GameState(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GameState", str)
	}
	return nil
}

func (e GameState) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type LetterGuess string

const (
	LetterGuessIncorrect  LetterGuess = "INCORRECT"
	LetterGuessInWord     LetterGuess = "IN_WORD"
	LetterGuessInLocation LetterGuess = "IN_LOCATION"
)

var AllLetterGuess = []LetterGuess{
	LetterGuessIncorrect,
	LetterGuessInWord,
	LetterGuessInLocation,
}

func (e LetterGuess) IsValid() bool {
	switch e {
	case LetterGuessIncorrect, LetterGuessInWord, LetterGuessInLocation:
		return true
	}
	return false
}

func (e LetterGuess) String() string {
	return string(e)
}

func (e *LetterGuess) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = LetterGuess(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid LetterGuess", str)
	}
	return nil
}

func (e LetterGuess) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GuessResult interface {
	IsGuessResult()
}

func (GameBoard) IsGuessResult() {}

type InvalidGuess struct {
	Error GuessError `json:"error"`
}

func (InvalidGuess) IsGuessResult() {}

type GuessError string

const (
	GuessErrorNotAWord      GuessError = "NotAWord"
	GuessErrorInvalidLength GuessError = "InvalidLength"
)

var AllGuessError = []GuessError{
	GuessErrorNotAWord,
	GuessErrorInvalidLength,
}

func (e GuessError) IsValid() bool {
	switch e {
	case GuessErrorNotAWord, GuessErrorInvalidLength:
		return true
	}
	return false
}

func (e GuessError) String() string {
	return string(e)
}

func (e *GuessError) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GuessError(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GuessError", str)
	}
	return nil
}

func (e GuessError) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
