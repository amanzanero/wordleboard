package models

import (
	"fmt"
)

type ErrNotFound struct {
	RepoMethod string
	Message    string
}

func (n ErrNotFound) Error() string {
	return fmt.Sprintf("NotFound (%s): %s", n.RepoMethod, n.Message)
}

type ErrRepoFailed struct {
	Message    string
	RepoMethod string
}

func (r ErrRepoFailed) Error() string {
	return fmt.Sprintf("RepoFailed (%s): %s", r.RepoMethod, r.Message)
}
