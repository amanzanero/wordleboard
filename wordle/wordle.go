package wordle

import "github.com/amanzanero/wordleboard/models"

func NewGame(day int) models.GameBoard {
	return models.GameBoard{
		Day:     day,
		Guesses: make([]*models.GuessState, 0),
		State:   models.GameStateInProgress,
	}
}
