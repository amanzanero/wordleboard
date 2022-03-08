FROM golang:1.16 as gobuilder

WORKDIR /app

# copy deps
COPY go.mod .
COPY go.sum .
RUN go mod download

COPY .. .
RUN export CGO_ENABLED=0 GOOS=linux && go build -o wordleboard .

FROM alpine
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
WORKDIR /app
COPY --from=gobuilder /app/wordleboard .
EXPOSE 8080
ENTRYPOINT ["./wordleboard"]
