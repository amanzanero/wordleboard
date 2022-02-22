package mongo

import (
	"context"
	"errors"
	"github.com/amanzanero/wordleboard/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type persistedGameBoard struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Day     int                `bson:"day"`
	Guesses []guess            `bson:"guesses"`
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

	guesses := make([]*models.GuessState, len(board.Guesses))
	for i, guess := range board.Guesses {
		guesses[i] = &models.GuessState{
			Letter: guess.Letter,
			Guess:  guess.Guess,
		}
	}

	return &models.GameBoard{
		ID:      board.ID.Hex(),
		Day:     board.Day,
		Guesses: guesses,
		State:   board.State,
		UserId:  board.UserId.Hex(),
	}, nil
}

func (s *Service) InsertGameBoard(ctx context.Context, gameboard models.GameBoard) error {
	userOid, _ := primitive.ObjectIDFromHex(gameboard.UserId)
	guesses := make([]guess, len(gameboard.Guesses))
	for i, g := range gameboard.Guesses {
		guesses[i] = guess{
			Letter: g.Letter,
			Guess:  g.Guess,
		}
	}
	persist := persistedGameBoard{
		Day:     gameboard.Day,
		Guesses: guesses,
		State:   gameboard.State,
		UserId:  userOid,
	}

	collection := s.database.Collection("gameboards")
	_, err := collection.InsertOne(ctx, persist)
	if err != nil {
		return err
	}

	return nil
}
