package mongo

import (
	"context"
	"errors"
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
			s.logger.Infof("FindLeaderboardByJoinId: no leadearboard with join_id %s", joinId)
			return nil, models.ErrNotFound
		} else {
			s.logger.Errorf("FindLeaderboardByJoinId failed: %v", result.Err())
			return nil, models.ErrRepoFailed
		}
	}

	leaderboard := new(persistLeaderboard)
	decodeErr := result.Decode(leaderboard)
	if decodeErr != nil {
		s.logger.Errorf("FindLeaderboardByJoinId failed: %v", decodeErr)
		return nil, models.ErrRepoFailed
	}

	model := persistedLeaderboardToModel(*leaderboard)
	return &model, nil
}

func (s *Service) InsertNewLeaderboard(ctx context.Context, leaderboard models.Leaderboard) (*models.Leaderboard, error) {
	collection := s.database.Collection("leaderboards")
	insert := leaderboardModelToPersisted(leaderboard)

	result, insertErr := collection.InsertOne(ctx, insert)
	if insertErr != nil {
		s.logger.Errorf("InsertNewLeaderboard failed: %v", insertErr)
		return nil, models.ErrRepoFailed
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
		s.logger.Errorf("UpdateLeaderboardById failed: %v", err)
		return models.ErrRepoFailed
	}
	if result.MatchedCount == 0 {
		s.logger.Warnf("UpdateLeaderboardById did not match any document with id %s", id)
		return models.ErrNotFound
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
			s.logger.Info("FindLeaderBoardMembers did not find any ids")
			return nil, models.ErrNotFound
		} else {
			s.logger.Errorf("FindLeaderBoardMembers failed: %v", err)
			return nil, models.ErrRepoFailed
		}
	}

	foundMembers := make([]*models.User, 0)

	for results.Next(ctx) {
		member := new(persistedUser)
		if err := results.Decode(member); err != nil {
			s.logger.Errorf("FindLeaderBoardMembers failed to decode: %v", err)
			return nil, models.ErrRepoFailed
		}
		model := &models.User{
			ID:          member.ID.String(),
			DisplayName: member.DisplayName,
			OauthId:     member.OauthUuid,
		}
		foundMembers = append(foundMembers, model)
	}
	if err := results.Err(); err != nil {
		s.logger.Errorf("FindLeaderBoardMembers failed: %v", err)
		return nil, models.ErrRepoFailed
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
			s.logger.Info("FindLeaderBoardMembers did not find any ids")
			return nil, models.ErrNotFound
		} else {
			s.logger.Errorf("FindLeaderBoardMembers failed: %v", err)
			return nil, models.ErrRepoFailed
		}
	}

	foundMembers := make([]*persistedUser, 0)

	for results.Next(ctx) {
		member := new(persistedUser)
		if err := results.Decode(member); err != nil {
			s.logger.Errorf("FindLeaderBoardMembers failed to decode: %v", err)
			return nil, models.ErrRepoFailed
		}
		foundMembers = append(foundMembers, member)
	}
	if err := results.Err(); err != nil {
		s.logger.Errorf("FindLeaderBoardMembers failed: %v", err)
		return nil, models.ErrRepoFailed
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
