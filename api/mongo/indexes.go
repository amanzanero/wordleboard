package mongo

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	gameboardIndex = mongo.IndexModel{
		Keys: bson.D{
			{Key: "day", Value: -1},
			{Key: "userId", Value: 1},
		},
		Options: nil,
	}
	userIndex = mongo.IndexModel{
		Keys:    bson.M{"oauth_id": 1},
		Options: nil,
	}
)
