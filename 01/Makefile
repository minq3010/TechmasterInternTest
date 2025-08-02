# Simple Makefile for Caro Game
.DEFAULT_GOAL := run

# Run server locally
run:
	@go run main.go

# Build binary
build:
	@go build -o bin/caro main.go

# Clean build artifacts
clean:
	@rm -rf bin/

# Start ngrok tunnel
ngrok:
	@echo "Starting ngrok tunnel to port 8080..."
	@ngrok http 8080
