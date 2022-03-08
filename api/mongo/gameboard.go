package mongo

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type persistedGameBoard struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Day     int                `bson:"day"`
	Guesses [][]guess          `bson:"guesses"`
	State   models.GameState   `bson:"state"`
	UserId  primitive.ObjectID `bson:"userId"`
}

type guess struct {
	Letter string             `bson:"letter"`
	Guess  models.LetterGuess `bson:"guess"`
}

func (s *Service) FindGameBoardByUserAndDay(ctx context.Context, userId string, day int) (*models.GameBoard, error) {
	userOid, _ := primitive.ObjectIDFromHex(userId)
	collection := s.database.Collection("gameboards")
	doc := collection.FindOne(ctx, bson.M{"userId": userOid, "day": day})
	if doc.Err() != nil {
		if errors.Is(doc.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound
		}
		return nil, models.ErrRepoFailed
	}

	board := new(persistedGameBoard)
	err := doc.Decode(board)
	if err != nil {
		return nil, models.ErrRepoFailed
	}

	guesses := make([][]models.GuessState, len(board.Guesses))
	for i, guessRow := range board.Guesses {
		row := make([]models.GuessState, 5)
		for j, guess := range guessRow {
			row[j] = models.GuessState{
				Letter: guess.Letter,
				Guess:  guess.Guess,
			}
		}
		guesses[i] = row
	}

	return &models.GameBoard{
		ID:      board.ID.Hex(),
		Day:     board.Day,
		Guesses: guesses,
		State:   board.State,
		UserId:  board.UserId.Hex(),
	}, nil
}

func modelToPersistedModel(gb models.GameBoard) persistedGameBoard {
	userOid, _ := primitive.ObjectIDFromHex(gb.UserId)
	guesses := make([][]guess, len(gb.Guesses))
	for i, guessRow := range gb.Guesses {
		row := make([]guess, len(guessRow))
		for j, g := range guessRow {
			row[j] = guess{
				Letter: g.Letter,
				Guess:  g.Guess,
			}
		}
		guesses[i] = row
	}
	return persistedGameBoard{
		Day:     gb.Day,
		Guesses: guesses,
		State:   gb.State,
		UserId:  userOid,
	}
}

func (s *Service) InsertGameBoard(ctx context.Context, gameBoard models.GameBoard) error {
	persist := modelToPersistedModel(gameBoard)
	collection := s.database.Collection("gameboards")
	_, err := collection.InsertOne(ctx, persist)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) UpdateGameBoardById(ctx context.Context, id string, gameBoard models.GameBoard) error {
	gameBoardOid, _ := primitive.ObjectIDFromHex(id)
	persist := modelToPersistedModel(gameBoard)
	collection := s.database.Collection("gameboards")
	result, err := collection.ReplaceOne(ctx, bson.M{"_id": gameBoardOid}, persist)
	if err != nil {
		return err
	} else if result.MatchedCount == 0 {
		return models.ErrNotFound
	}
	return nil
}
