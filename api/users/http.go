package users

import (
	"encoding/json"
	"errors"
	"github.com/amanzanero/wordleboard/api/models"
	"net/http"
)

func (s *Service) CreateUserHandler() http.HandlerFunc {
	type requestParams struct {
		OauthId     string `json:"oauth_id"`
		DisplayName string `json:"display_name"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		defer r.Body.Close()

		params := new(requestParams)
		err := decoder.Decode(params)
		if err != nil {
			respondWithError(w, 400, "invalid input")
			return
		}

		// check if user exists
		_, findErr := s.Repo.FindUserByUuid(r.Context(), params.OauthId)
		if findErr == nil {
			s.Logger.Infof("user with id: %s already exists, exiting", params.OauthId)
			RespondWithJSON(w, 201, map[string]string{"msg": "succeeded"})
			return
		} else if errors.Is(findErr, models.ErrRepoFailed) {
			s.Logger.Errorf("failed to fetch user from repo: %v", findErr)
			respondWithError(w, 500, findErr.Error())
			return
		}

		// let's verify the oathId
		_, fetchUserFromAuthServiceErr := s.Client.GetUser(r.Context(), params.OauthId)
		if fetchUserFromAuthServiceErr != nil {
			s.Logger.Infof("failed to find fetch user from firebase: %v", fetchUserFromAuthServiceErr)
			respondWithError(w, 400, "user does not exist")
			return
		}

		// ok user doesn't exist so let's make it
		createErr := s.Repo.InsertUser(r.Context(), models.NewUser{
			ID:          params.OauthId,
			DisplayName: params.DisplayName,
		})
		if createErr != nil {
			s.Logger.Errorf("failed to create user: %v", createErr)
			respondWithError(w, 500, "internal error")
			return
		}
		RespondWithJSON(w, 200, map[string]string{"msg": "success"})
	}
}
