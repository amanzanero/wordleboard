package wordle

import (
	"encoding/json"
	"os"
)

func loadGuesses() (map[string]bool, error) {
	bytes, err := os.ReadFile("./guesses.json")
	if err != nil {
		return nil, err
	}
	data := make(map[string]bool)
	err = json.Unmarshal(bytes, &data)
	if err != nil {
		panic(err)
	}
	return data, err
}

func loadSolutions() ([]string, error) {
	bytes, err := os.ReadFile("./solutions.json")
	if err != nil {
		return nil, err
	}
	data := make([]string, 0)
	err = json.Unmarshal(bytes, &data)
	return data, err
}
