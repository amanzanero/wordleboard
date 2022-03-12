package users

import (
	"context"
	"github.com/amanzanero/wordleboard/api/models"
	"net/http"
	"strings"
)

// A private key for context that only this package can access. This is important
// to prevent collisions between different context uses
var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

func (s *Service) AuthMiddleware(handler http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		bearerToken := strings.Replace(auth, "Bearer ", "", 1)
		userUuid, err := s.ValidateIDToken(r.Context(), bearerToken)
		if err != nil {
			http.Error(w, "Invalid auth", http.StatusForbidden)
			return
		}
		user, lookupErr := s.Repo.FindUserByUuid(r.Context(), userUuid)
		if lookupErr != nil {
			s.Logger.Warnf("could not find authenticated user with uuid: %s, error: %v", userUuid, lookupErr)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}

		ctx := context.WithValue(r.Context(), userCtxKey, user)
		r = r.WithContext(ctx)
		handler.ServeHTTP(w, r)
	}
}

// ForContext finds the user from the context. REQUIRES Middleware to have run.
func ForContext(ctx context.Context) *models.User {
	raw, _ := ctx.Value(userCtxKey).(*models.User)
	return raw
}
