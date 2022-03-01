package users

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"io"
	"net/http"
)

func (s *Service) createCustomAuthToken(ctx context.Context, UID string) (string, error) {
	token, err := s.Client.CustomToken(ctx, UID)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) CustomTokenRoute(tokenValidationEndpoint string) http.HandlerFunc {
	type response struct {
		Token string `json:"token"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		uid := chi.URLParam(r, "uid")
		token, err := s.createCustomAuthToken(r.Context(), uid)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}

		body, _ := json.Marshal(map[string]interface{}{
			"token":             token,
			"returnSecureToken": true,
		})
		s.Logger.Infof("making request to %s", tokenValidationEndpoint)
		resp, httpErr := http.Post(
			tokenValidationEndpoint,
			"application/json",
			bytes.NewBuffer(body),
		)
		if httpErr != nil {
			respondWithError(w, http.StatusInternalServerError, httpErr.Error())
			return
		}
		defer func(Body io.ReadCloser) {
			_ = Body.Close()
		}(resp.Body)

		if resp.StatusCode != http.StatusOK {
			RespondWithJSON(w, resp.StatusCode, errors.New(fmt.Sprintf("code: %d", resp.StatusCode)))
			return
		}

		var httpResponse map[string]interface{}
		decodeErr := json.NewDecoder(resp.Body).Decode(&httpResponse)
		if decodeErr != nil {
			respondWithError(w, http.StatusInternalServerError, decodeErr.Error())
			return
		}
		responseToken, ok := httpResponse["idToken"].(string)
		if !ok {
			respondWithError(w, http.StatusInternalServerError, "could not get id token")
			return
		}

		response := new(response)
		response.Token = responseToken
		RespondWithJSON(w, http.StatusOK, response)
	}
}

// respondWithError returns error message
func respondWithError(w http.ResponseWriter, code int, msg string) {
	RespondWithJSON(w, code, map[string]string{"message": msg})
}

// RespondWithJSON writes json response format
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_, _ = w.Write(response)
}
