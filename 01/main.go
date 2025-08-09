package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

const (
	BOARD_SIZE = 15
	WIN_COUNT  = 5
)

type GameState struct {
	Board         [][]string `json:"board"`
	CurrentPlayer string     `json:"currentPlayer"`
	GameOver      bool       `json:"gameOver"`
	Winner        string     `json:"winner"`
	WinningCells  [][]int    `json:"winningCells"`
}

type Move struct {
	Row    int    `json:"row"`
	Col    int    `json:"col"`
	Player string `json:"player"`
}

type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	GameState *GameState  `json:"gameState,omitempty"`
}

type Client struct {
	Conn   *websocket.Conn
	Player string
	Send   chan Message
}

type GameRoom struct {
	Clients     map[*Client]bool
	Broadcast   chan Message
	Register    chan *Client
	Unregister  chan *Client
	GameState   *GameState
	PlayerCount int
	mutex       sync.RWMutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewGameRoom() *GameRoom {
	return &GameRoom{
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		GameState: &GameState{
			Board:         initBoard(),
			CurrentPlayer: "X",
			GameOver:      false,
			Winner:        "",
			WinningCells:  [][]int{},
		},
		PlayerCount: 0,
	}
}

func initBoard() [][]string {
	board := make([][]string, BOARD_SIZE)
	for i := range board {
		board[i] = make([]string, BOARD_SIZE)
		for j := range board[i] {
			board[i][j] = ""
		}
	}
	return board
}

func (room *GameRoom) Run() {
	for {
		select {
		case client := <-room.Register:
			room.mutex.Lock()
			room.Clients[client] = true
			room.PlayerCount++

			// Assign player role
			switch room.PlayerCount {
			case 1:
				client.Player = "X"
			case 2:
				client.Player = "O"
			}

			room.mutex.Unlock()

			select {
			case client.Send <- Message{
				Type:      "gameState",
				GameState: room.GameState,
				Data:      map[string]interface{}{"player": client.Player},
			}:
			default:
				close(client.Send)
				delete(room.Clients, client)
				room.PlayerCount--
			}

			log.Printf(
				"Client connected. Player: %s, Total players: %d",
				client.Player,
				room.PlayerCount,
			)

		case client := <-room.Unregister:
			room.mutex.Lock()
			if _, ok := room.Clients[client]; ok {
				delete(room.Clients, client)
				close(client.Send)
				room.PlayerCount--
				log.Printf("Client disconnected. Total players: %d", room.PlayerCount)
			}
			room.mutex.Unlock()

		case message := <-room.Broadcast:
			room.mutex.RLock()
			for client := range room.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(room.Clients, client)
					room.PlayerCount--
				}
			}
			room.mutex.RUnlock()
		}
	}
}

func (room *GameRoom) MakeMove(move Move) bool {
	room.mutex.Lock()
	defer room.mutex.Unlock()

	if room.GameState.GameOver {
		return false
	}

	if move.Player != room.GameState.CurrentPlayer {
		return false
	}

	if move.Row < 0 || move.Row >= BOARD_SIZE || move.Col < 0 || move.Col >= BOARD_SIZE {
		return false
	}

	if room.GameState.Board[move.Row][move.Col] != "" {
		return false
	}

	room.GameState.Board[move.Row][move.Col] = move.Player

	if room.checkWin(move.Row, move.Col, move.Player) {
		room.GameState.GameOver = true
		room.GameState.Winner = move.Player
	} else if room.isBoardFull() {
		room.GameState.GameOver = true
		room.GameState.Winner = "draw"
	} else {
		if room.GameState.CurrentPlayer == "X" {
			room.GameState.CurrentPlayer = "O"
		} else {
			room.GameState.CurrentPlayer = "X"
		}
	}

	return true
}

func (room *GameRoom) checkWin(row, col int, player string) bool {
	directions := [][]int{
		{0, 1},  // horizontal
		{1, 0},  // vertical
		{1, 1},  // diagonal \
		{1, -1}, // diagonal /
	}

	for _, dir := range directions {
		count := 1
		winCells := [][]int{{row, col}}

		// Check forward direction
		for i := 1; i < WIN_COUNT; i++ {
			newRow := row + dir[0]*i
			newCol := col + dir[1]*i

			if room.isValidPosition(newRow, newCol) &&
				room.GameState.Board[newRow][newCol] == player {
				count++
				winCells = append(winCells, []int{newRow, newCol})
			} else {
				break
			}
		}

		// Check backward direction
		for i := 1; i < WIN_COUNT; i++ {
			newRow := row - dir[0]*i
			newCol := col - dir[1]*i

			if room.isValidPosition(newRow, newCol) &&
				room.GameState.Board[newRow][newCol] == player {
				count++
				winCells = append([][]int{{newRow, newCol}}, winCells...)
			} else {
				break
			}
		}

		if count >= WIN_COUNT {
			// Take only the first 5 cells
			if len(winCells) > WIN_COUNT {
				winCells = winCells[:WIN_COUNT]
			}
			room.GameState.WinningCells = winCells
			return true
		}
	}

	return false
}

func (room *GameRoom) isValidPosition(row, col int) bool {
	return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

func (room *GameRoom) isBoardFull() bool {
	for i := 0; i < BOARD_SIZE; i++ {
		for j := 0; j < BOARD_SIZE; j++ {
			if room.GameState.Board[i][j] == "" {
				return false
			}
		}
	}
	return true
}

func (room *GameRoom) ResetGame() {
	room.mutex.Lock()
	defer room.mutex.Unlock()

	room.GameState = &GameState{
		Board:         initBoard(),
		CurrentPlayer: "X",
		GameOver:      false,
		Winner:        "",
		WinningCells:  [][]int{},
	}
}

func handleWebSocket(room *GameRoom, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		Conn: conn,
		Send: make(chan Message, 256),
	}

	room.Register <- client

	go client.WritePump()
	go client.ReadPump(room)
}

func (c *Client) ReadPump(room *GameRoom) {
	defer func() {
		room.Unregister <- c
		c.Conn.Close()
	}()

	for {
		var msg Message
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(
				err,
				websocket.CloseGoingAway,
				websocket.CloseAbnormalClosure,
			) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		switch msg.Type {
		case "move":
			var move Move
			if data, ok := msg.Data.(map[string]interface{}); ok {
				if row, ok := data["row"].(float64); ok {
					move.Row = int(row)
				}
				if col, ok := data["col"].(float64); ok {
					move.Col = int(col)
				}
				if player, ok := data["player"].(string); ok {
					move.Player = player
				}
			}

			if room.MakeMove(move) {
				room.Broadcast <- Message{
					Type:      "gameState",
					GameState: room.GameState,
				}
			}

		case "reset":
			room.ResetGame()
			room.Broadcast <- Message{
				Type:      "gameState",
				GameState: room.GameState,
			}
		}
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()
	for message := range c.Send {
		if err := c.Conn.WriteJSON(message); err != nil {
			log.Printf("WebSocket write error: %v", err)
			return
		}
	}
	c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
}

func main() {
	room := NewGameRoom()
	go room.Run()

	// Serve static files
	http.Handle("/", http.FileServer(http.Dir("./src/")))

	// WebSocket endpoint
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleWebSocket(room, w, r)
	})

	log.Println("Server starting on :8080")
	log.Printf("Open http://localhost:8080 in two browser windows to play")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
