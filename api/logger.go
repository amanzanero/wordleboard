package main

import (
	"fmt"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/sirupsen/logrus"
	"net"
	"net/http"
	"time"
)

// HttpLoggingMiddleware returns a request logging middleware
func HttpLoggingMiddleware(logger logrus.FieldLogger, isDev bool) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			reqID := middleware.GetReqID(r.Context())
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			t1 := time.Now()
			defer func() {
				remoteIP, _, err := net.SplitHostPort(r.RemoteAddr)
				if err != nil {
					remoteIP = r.RemoteAddr
				}
				category := "static"
				if r.RequestURI == "/graphql" {
					category = "graphql"
				}
				fields := logrus.Fields{
					"status":        ww.Status(),
					"userAgent":     r.UserAgent(),
					"responseSize":  ww.BytesWritten(),
					"latency":       fmt.Sprintf("%.6fs", time.Since(t1).Seconds()),
					"remoteIp":      remoteIP,
					"protocol":      r.Proto,
					"requestMethod": r.Method,
					"requestUrl":    r.RequestURI,
					"referer":       r.Referer(),
				}

				outerField := logrus.Fields{
					"category": category,
				}
				var entry *logrus.Entry
				if isDev {
					entry = logger.WithFields(outerField).WithFields(fields)
				} else {
					outerField["httpRequest"] = fields
					entry = logger.WithFields(outerField)
				}

				if len(reqID) > 0 {
					outerField["request_id"] = reqID
				}

				entry.Infof("served %s", r.RequestURI)
			}()

			h.ServeHTTP(ww, r)
		}

		return http.HandlerFunc(fn)
	}
}
