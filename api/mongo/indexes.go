package mongo

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	leaderboardIndex = mongo.IndexModel{
		Keys:    bson.M{"join_id": 1},
		Options: nil,
	}
	userIndex = mongo.IndexModel{
		Keys:    bson.M{"oauth_uuid": 1},
		Options: nil,
	}
)
