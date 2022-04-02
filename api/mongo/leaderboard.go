package mongo

import (
	"context"
	"errors"
	"fmt"
	"github.com/amanzanero/wordleboard/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type persistLeaderboard struct {
	Id      primitive.ObjectID   `bson:"_id,omitempty"`
	Name    string               `bson:"name"`
	Members []primitive.ObjectID `bson:"member_ids"`
	JoinId  string               `bson:"join_id"`
	OwnerId primitive.ObjectID   `bson:"owner_id"`
}

func persistedLeaderboardToModel(lb persistLeaderboard) models.Leaderboard {
	ids := make([]string, len(lb.Members))
	for i, id := range lb.Members {
		ids[i] = id.Hex()
	}

	return models.Leaderboard{
		ID:        lb.JoinId,
		Name:      lb.Name,
		MemberIds: ids,
		StoredId:  lb.Id.Hex(),
		Owner:     lb.OwnerId.Hex(),
	}
}

func leaderboardModelToPersisted(lb models.Leaderboard) persistLeaderboard {
	ownerOid, _ := primitive.ObjectIDFromHex(lb.Owner)

	ids := make([]primitive.ObjectID, len(lb.MemberIds))
	for i, id := range lb.MemberIds {
		oid, _ := primitive.ObjectIDFromHex(id)
		ids[i] = oid
	}
	return persistLeaderboard{
		Name:    lb.Name,
		Members: ids,
		JoinId:  lb.ID,
		OwnerId: ownerOid,
	}
}

func (s *Service) FindLeaderboardByJoinId(ctx context.Context, joinId string) (*models.Leaderboard, error) {
	collection := s.database.Collection("leaderboards")
	filter := bson.M{"join_id": joinId}
	result := collection.FindOne(ctx, filter)
	if result.Err() != nil {
		if errors.Is(result.Err(), mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound{Message: fmt.Sprintf("no leadearboard with join_id %s", joinId), RepoMethod: "FindLeaderboardByJoinId"}
		} else {
			return nil, models.ErrRepoFailed{
				Message:    result.Err().Error(),
				RepoMethod: "FindLeaderboardByJoinId",
			}
		}
	}

	leaderboard := new(persistLeaderboard)
	decodeErr := result.Decode(leaderboard)
	if decodeErr != nil {
		return nil, models.ErrRepoFailed{Message: decodeErr.Error(), RepoMethod: "FindLeaderboardByJoinId"}
	}

	model := persistedLeaderboardToModel(*leaderboard)
	return &model, nil
}

func (s *Service) InsertNewLeaderboard(ctx context.Context, leaderboard models.Leaderboard) (*models.Leaderboard, error) {
	collection := s.database.Collection("leaderboards")
	insert := leaderboardModelToPersisted(leaderboard)

	result, insertErr := collection.InsertOne(ctx, insert)
	if insertErr != nil {
		return nil, models.ErrRepoFailed{Message: insertErr.Error(), RepoMethod: "InsertNewLeaderboard"}
	}

	id, _ := result.InsertedID.(primitive.ObjectID)
	insert.Id = id
	model := persistedLeaderboardToModel(insert)
	return &model, nil
}

func (s *Service) UpdateLeaderboardById(ctx context.Context, id string, leaderboard models.Leaderboard) error {
	oid, _ := primitive.ObjectIDFromHex(id)
	persist := leaderboardModelToPersisted(leaderboard)
	collection := s.database.Collection("leaderboards")

	result, err := collection.UpdateOne(ctx, bson.M{"_id": oid}, bson.M{"$set": persist})
	if err != nil {
		return models.ErrRepoFailed{Message: err.Error(), RepoMethod: "UpdateLeaderboardById"}
	}
	if result.MatchedCount == 0 {
		return models.ErrNotFound{Message: fmt.Sprintf("did not match any document with id %s", id), RepoMethod: "UpdateLeaderboardById"}
	}

	return nil
}

func (s *Service) FindLeaderBoardMembers(ctx context.Context, members []string) ([]*models.User, error) {
	collection := s.database.Collection("users")
	oids := bson.A{}
	for _, id := range members {
		oid, _ := primitive.ObjectIDFromHex(id)
		oids = append(oids, oid)
	}

	filter := bson.M{"_id": bson.M{"$in": oids}}
	opts := options.Find().SetProjection(bson.M{"game_boards": 0})

	results, err := collection.Find(ctx, filter, opts)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound{Message: "did not find any ids", RepoMethod: "FindLeaderBoardMembers"}
		} else {
			return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindLeaderBoardMembers"}
		}
	}

	foundMembers := make([]*models.User, 0)

	for results.Next(ctx) {
		member := new(persistedUser)
		if err := results.Decode(member); err != nil {
			return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindLeaderBoardMembers"}
		}
		model := &models.User{
			ID:          member.ID.Hex(),
			DisplayName: member.DisplayName,
			OauthId:     member.OauthUuid,
		}
		foundMembers = append(foundMembers, model)
	}
	if err := results.Err(); err != nil {
		return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindLeaderBoardMembers"}
	}
	return foundMembers, nil
}

func (s *Service) FindLeaderboardStatsForMembers(ctx context.Context, members []string) (map[models.User][]models.UserStat, error) {
	collection := s.database.Collection("users")
	oids := bson.A{}
	for _, id := range members {
		oid, _ := primitive.ObjectIDFromHex(id)
		oids = append(oids, oid)
	}

	filter := bson.M{"_id": bson.M{"$in": oids}}
	//opts := options.Find().SetProjection(bson.M{"game_boards": 1})

	results, err := collection.Find(ctx, filter) //, opts)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, models.ErrNotFound{Message: "did not find any ids", RepoMethod: "FindLeaderboardStatsForMembers"}
		} else {
			return nil, models.ErrNotFound{Message: err.Error(), RepoMethod: "FindLeaderboardStatsForMembers"}
		}
	}

	foundMembers := make([]*persistedUser, 0)

	for results.Next(ctx) {
		member := new(persistedUser)
		if err := results.Decode(member); err != nil {
			return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindLeaderBoardMembers"}
		}
		foundMembers = append(foundMembers, member)
	}
	if err := results.Err(); err != nil {
		return nil, models.ErrRepoFailed{Message: err.Error(), RepoMethod: "FindLeaderBoardMembers"}
	}

	// now transform into stats
	stats := make(map[models.User][]models.UserStat)
	for _, member := range foundMembers {
		usr := persistedUserToModel(*member)
		stats[usr] = make([]models.UserStat, len(member.GameBoards))
		for i, board := range member.GameBoards {
			stats[usr][i] = models.UserStat{
				Day:     board.Day,
				Guesses: persistedGuessesToModel(board.Guesses),
				State:   board.State,
				User:    usr,
			}
		}
	}
	return stats, nil
}

func (s *Service) FindLeaderboardsForUser(ctx context.Context, userId string) ([]*models.Leaderboard, error) {
	userOid, _ := primitive.ObjectIDFromHex(userId)
	collection := s.database.Collection("leaderboards")
	filter := bson.M{"member_ids": bson.M{"$elemMatch": bson.M{"$eq": userOid}}}

	leaderboards, lookupErr := collection.Find(ctx, filter)
	if lookupErr != nil {
		return nil, models.ErrRepoFailed{Message: lookupErr.Error(), RepoMethod: "FindLeaderboardsForUser"}
	}

	lbs := make([]*models.Leaderboard, 0)
	for leaderboards.Next(ctx) {
		persistedLb := new(persistLeaderboard)
		decodeErr := leaderboards.Decode(persistedLb)
		if decodeErr != nil {
			return nil, models.ErrRepoFailed{Message: decodeErr.Error(), RepoMethod: "FindLeaderboardsForUser"}
		}
		model := persistedLeaderboardToModel(*persistedLb)
		lbs = append(lbs, &model)
	}
	if leaderboards.Err() != nil {
		return nil, models.ErrRepoFailed{Message: leaderboards.Err().Error(), RepoMethod: "FindLeaderboardsForUser"}
	}

	return lbs, nil
}

func (s *Service) FindGameBoardsForUser(ctx context.Context, userId string) ([]*models.GameBoard, error) {
	userOid, _ := primitive.ObjectIDFromHex(userId)
	collection := s.database.Collection("users")
	filter := bson.M{"_id": userOid}

	documentResult := collection.FindOne(ctx, filter)
	if documentResult.Err() != nil {
		return nil, models.ErrRepoFailed{Message: documentResult.Err().Error(), RepoMethod: "FindLeaderboardsForUser"}
	}

	pu := new(persistedUser)
	decodeErr := documentResult.Decode(pu)
	if decodeErr != nil {
		return nil, models.ErrRepoFailed{Message: decodeErr.Error(), RepoMethod: "FindLeaderboardsForUser"}
	}

	gameBoards := make([]*models.GameBoard, 0)
	for _, gb := range pu.GameBoards {
		gameBoards = append(
			gameBoards,
			&models.GameBoard{
				Day:     gb.Day,
				Guesses: persistedGuessesToModel(gb.Guesses),
				State:   gb.State,
			},
		)
	}
	return gameBoards, nil
}
