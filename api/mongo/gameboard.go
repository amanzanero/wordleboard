package mongo

import (
	"context"
	"errors"
	"fmt"
	"github.com/amanzanero/wordleboard/api/logging"
	"github.com/amanzanero/wordleboard/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type persistedGameBoard struct {
	Day     int              `bson:"day"`
	Guesses [][]guess        `bson:"guesses"`
	State   models.GameState `bson:"state"`
}

type guess struct {
	Letter string             `bson:"letter"`
	Guess  models.LetterGuess `bson:"guess"`
}

func persistedGuessesToModel(persistedGuesses [][]guess) [][]models.GuessState {
	guesses := make([][]models.GuessState, len(persistedGuesses))
	for i, guessRow := range persistedGuesses {
		row := make([]models.GuessState, 5)
		for j, guess := range guessRow {
			row[j] = models.GuessState{
				Letter: guess.Letter,
				Guess:  guess.Guess,
			}
		}
		guesses[i] = row
	}
	return guesses
}

func (s *Service) FindGameBoardByUserAndDay(ctx context.Context, userId string, day int) (*models.GameBoard, error) {
	userOid, _ := primitive.ObjectIDFromHex(userId)
	projection := bson.M{"game_boards": bson.M{"$elemMatch": bson.M{"day": day}}}
	opt := options.FindOne().SetProjection(projection)

	collection := s.database.Collection("users")
	doc := collection.FindOne(ctx, bson.M{"_id": userOid}, opt)
	if documentErr := doc.Err(); documentErr != nil {
		var errToReturn models.ErrRepoFailed
		if errors.Is(documentErr, mongo.ErrNoDocuments) {
			errToReturn = models.ErrRepoFailed{
				Message:    "invalid state, no user",
				RepoMethod: "FindGameBoardByUserAndDay",
			}
		} else {
			errToReturn = models.ErrRepoFailed{
				Message:    documentErr.Error(),
				RepoMethod: "FindGameBoardByUserAndDay",
			}
		}
		return nil, errToReturn
	}

	user := new(persistedUser)
	err := doc.Decode(user)
	if err != nil {
		return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindGameBoardByUserAndDay"}
	}

	if len(user.GameBoards) == 0 {
		return nil, models.ErrNotFound{RepoMethod: "FindGameBoardByUserAndDay", Message: "no gameboards found for user"}
	}
	board := user.GameBoards[0]

	return &models.GameBoard{
		Day:     board.Day,
		Guesses: persistedGuessesToModel(board.Guesses),
		State:   board.State,
	}, nil
}

func gameBoardModelToPersistedModel(gb models.GameBoard) persistedGameBoard {
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
	}
}

func (s *Service) InsertGameBoard(ctx context.Context, userId string, gameBoard models.GameBoard) error {
	persist := gameBoardModelToPersistedModel(gameBoard)
	userOid, _ := primitive.ObjectIDFromHex(userId)

	collection := s.database.Collection("users")
	filter := bson.M{"_id": userOid}
	update := bson.M{"$push": bson.M{
		"game_boards": bson.D{
			{"$each", bson.A{persist}},
			{"$sort", bson.M{"day": 1}},
		},
	}}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logging.FromContext(ctx).Errorf("error in InsertGameBoard: %v", err)
		return err
	}
	if result.MatchedCount == 0 {
		logging.FromContext(ctx).Errorf("error in InsertGameBoard: %v", err)
		return errors.New(fmt.Sprintf("error in InsertGameBoard: no user with id %s found", userId))
	}
	return nil
}

func (s *Service) UpdateGameBoardByUserAndDay(ctx context.Context, day int, userId string, gameBoard models.GameBoard) error {
	userOid, _ := primitive.ObjectIDFromHex(userId)
	persist := gameBoardModelToPersistedModel(gameBoard)

	collection := s.database.Collection("users")
	filter := bson.M{"_id": userOid, "game_boards.day": day}
	update := bson.M{"$set": bson.M{
		"game_boards.$": persist,
	}}
	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return models.ErrRepoFailed{
			Message:    err.Error(),
			RepoMethod: "UpdateGameBoardByUserAndDay",
		}
	} else if result.MatchedCount == 0 {
		return models.ErrNotFound{RepoMethod: "UpdateGameBoardByUserAndDay", Message: "did not update any documents"}
	}
	return nil
}
