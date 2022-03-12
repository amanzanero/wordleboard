package secrets

import "os"

var (
	// these should be used in development
	firebaseCredentials = os.Getenv("FIREBASE_ADMIN_CREDENTIALS")
	firebaseWebAPIKey   = os.Getenv("FIREBASE_WEB_API_KEY")
	firebaseEndpoint    = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key="
	port                = os.Getenv("PORT")
	mongoUri            = os.Getenv("MONGO_URI")
)

const (
	gCloudSecretWordleBoardStoreKey = "projects/681271286954/secrets/wordleboard-store-url/versions/latest"
)

type Secret = int

const (
	FirebaseCredentials Secret = iota
	FirebaseEndpoint
	Port
	MongoUri
)
