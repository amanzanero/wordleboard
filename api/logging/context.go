package logging

import (
	"context"
	"github.com/sirupsen/logrus"
)

type ctxKey struct {
	name string
}

var requestCtxKey = ctxKey{name: "requestContextKey"}

func FromContext(ctx context.Context) *logrus.Entry {
	entry, ok := ctx.Value(requestCtxKey).(*logrus.Entry)
	if !ok {
		return nil
	}
	return entry
}
