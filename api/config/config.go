package config

import "os"

var (
	FirebaseCredentials = os.Getenv("FIREBASE_ADMIN_CREDENTIALS")
	FirebaseWebAPIKey   = os.Getenv("FIREBASE_WEB_API_KEY")
	FirebaseEndpoint    = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=" + FirebaseWebAPIKey
	Port                = os.Getenv("PORT")
	MongoUri            = os.Getenv("MONGO_URI")
)
