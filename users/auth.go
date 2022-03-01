package users

import (
	"context"
)

func (s *Service) ValidateIDToken(ctx context.Context, bearerToken string) (string, error) {
	idToken, validateErr := s.Client.VerifyIDToken(ctx, bearerToken)
	if validateErr != nil || idToken == nil {
		return "", validateErr
	}

	return idToken.UID, nil
}
