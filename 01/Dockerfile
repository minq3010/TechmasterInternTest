FROM golang:1.24-alpine

WORKDIR /src/app

RUN apk add --no-cache git curl

# Cài air
RUN go install github.com/cosmtrek/air@v1.40.4

COPY . .

CMD ["air", "-c", ".air.toml"]