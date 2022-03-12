package secrets

import (
	"bytes"
	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"context"
	"encoding/base64"
	"fmt"
	"github.com/sirupsen/logrus"
	secretmanagerpb "google.golang.org/genproto/googleapis/cloud/secretmanager/v1"
	"io"
)

type Manager struct {
	IsDev        bool
	Logger       *logrus.Logger
	secretsCache map[Secret]interface{}
}

func NewManager(isDev bool, logger *logrus.Logger) Manager {
	return Manager{
		IsDev:        isDev,
		Logger:       logger,
		secretsCache: make(map[Secret]interface{}),
	}
}

// Initialize loads all the secret keys from the environment if in development, or from google cloud
// secret manager if in production
func (m *Manager) Initialize() {
	if m.IsDev {
		m.secretsCache[FirebaseCredentials] = m.firebaseCredentialsBytes()
		m.secretsCache[MongoUri] = mongoUri
		m.secretsCache[FirebaseEndpoint] = firebaseEndpoint + firebaseWebAPIKey
	} else {
		// Create the secret manager client.
		ctx := context.Background()
		client, err := secretmanager.NewClient(ctx)
		if err != nil {
			m.Logger.Fatalf("failed to create secretmanager client: %v", err)
			return
		}
		defer client.Close()

		b := new(bytes.Buffer)
		fetchErr := accessSecretVersion(ctx, client, b, gCloudSecretWordleBoardStoreKey)
		if fetchErr != nil {
			m.Logger.Fatalf("error retrieving secret %s: %v", gCloudSecretWordleBoardStoreKey, fetchErr)
			return
		}
		m.secretsCache[MongoUri] = b.String()
	}
	m.secretsCache[Port] = port
}

func (m *Manager) GetSecretString(secret Secret) string {
	if s, ok := m.secretsCache[secret].(string); ok {
		return s
	}
	m.Logger.Fatalf("secret: %d is not a string", secret)
	return ""
}

func (m *Manager) GetSecretBytes(secret Secret) []byte {
	if s, ok := m.secretsCache[secret].([]byte); ok {
		return s
	}
	m.Logger.Fatalf("secret: %d is not a string", secret)
	return nil
}

// FirebaseCredentialsBytes should only be used in development, when credentials are needed
func (m *Manager) firebaseCredentialsBytes() []byte {
	if !m.IsDev {
		return nil
	}

	// decode firebase credentials
	credentialsBytes, credentialsErr := base64.StdEncoding.DecodeString(firebaseCredentials)
	if credentialsErr != nil {
		m.Logger.Fatalf("firebase credentials error: %v", credentialsErr)
	}
	return credentialsBytes
}

// accessSecretVersion accesses the payload for the given secret version if one
// exists. The version can be a version number as a string (e.g. "5") or an
// alias (e.g. "latest").
func accessSecretVersion(ctx context.Context, client *secretmanager.Client, w io.Writer, name string) error {
	// Build the request.
	req := &secretmanagerpb.AccessSecretVersionRequest{
		Name: name,
	}

	// Call the API.
	result, err := client.AccessSecretVersion(ctx, req)
	if err != nil {
		return fmt.Errorf("failed to access secret version: %v", err)
	}

	_, writeErr := w.Write(result.Payload.Data)
	return writeErr
}
