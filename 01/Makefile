.DEFAULT_GOAL := run

run:
	@go run main.go

build:
	@go build -o bin/caro main.go

clean:
	@rm -rf bin/

ngrok:
	@echo "Starting ngrok tunnel to port 8080..."
	@ngrok http 8080
