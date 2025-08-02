 class CaroGame {
    constructor() {
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winningCells = [];
        this.myPlayer = null; // Player assigned by server
        this.socket = null;
        this.connected = false;
        
        this.initBoard();
        this.connectWebSocket();
    }

    connectWebSocket() {
        const wsUrl = `ws://${window.location.host}/ws`;
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            console.log('Connected to server');
            this.connected = true;
            this.updateConnectionStatus('Đã kết nối với server');
        };
        
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleServerMessage(message);
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.updateConnectionStatus('Mất kết nối với server');
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('Lỗi kết nối');
        };
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'gameState':
                this.updateGameState(message.gameState);
                if (message.data && message.data.player) {
                    this.myPlayer = message.data.player;
                    this.updatePlayerInfo();
                }
                break;
        }
    }

    updateGameState(gameState) {
        this.board = gameState.board;
        this.currentPlayer = gameState.currentPlayer;
        this.gameOver = gameState.gameOver;
        this.winningCells = gameState.winningCells || [];
        
        this.renderBoard();
        this.updateUI();
        
        if (gameState.gameOver) {
            let message;
            if (gameState.winner === 'draw') {
                message = '🤝 Hòa cờ!';
            } else {
                message = `🎉 Người chơi ${gameState.winner} thắng!`;
            }
            this.endGame(message);
            this.highlightWinningCells();
        }
    }

    updateConnectionStatus(status) {
        // Add connection status to UI
        let statusElement = document.querySelector('.connection-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'connection-status';
            document.querySelector('.game-header').appendChild(statusElement);
        }
        statusElement.textContent = status;
    }

    updatePlayerInfo() {
        if (this.myPlayer) {
            const statusElement = document.querySelector('.game-status');
            const playerRole = `Bạn là người chơi ${this.myPlayer}`;
            statusElement.innerHTML = `<div class="player-role">${playerRole}</div><span class="current-player">Người chơi ${this.currentPlayer}</span> đang lượt`;
        }
    }

    initBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.makeMove(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    renderBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const value = this.board[row][col];
                
                cell.textContent = value;
                cell.className = 'cell';
                
                if (value) {
                    cell.classList.add(value.toLowerCase());
                }
            }
        }
    }

    makeMove(row, col) {
        // Check if it's our turn and we're connected
        if (!this.connected || this.gameOver || this.myPlayer !== this.currentPlayer) {
            return;
        }
        
        // Check if cell is empty
        if (this.board[row][col] !== '') {
            return;
        }
        
        // Send move to server
        const move = {
            type: 'move',
            data: {
                row: row,
                col: col,
                player: this.myPlayer
            }
        };
        
        this.socket.send(JSON.stringify(move));
    }

    updateUI() {
        const statusElement = document.querySelector('.game-status');
        const currentPlayerText = this.myPlayer === this.currentPlayer ? 
            `<span class="current-player your-turn">Lượt của bạn (${this.currentPlayer})</span>` :
            `<span class="current-player">Người chơi ${this.currentPlayer} đang lượt</span>`;
        
        if (this.myPlayer) {
            const playerRole = `Bạn là người chơi ${this.myPlayer}`;
            statusElement.innerHTML = `<div class="player-role">${playerRole}</div>${currentPlayerText}`;
        } else {
            statusElement.innerHTML = currentPlayerText;
        }

        // Update player info panels
        document.getElementById('playerX').classList.toggle('active', this.currentPlayer === 'X');
        document.getElementById('playerO').classList.toggle('active', this.currentPlayer === 'O');
        
        // Highlight my player
        if (this.myPlayer) {
            document.getElementById('playerX').classList.toggle('my-player', this.myPlayer === 'X');
            document.getElementById('playerO').classList.toggle('my-player', this.myPlayer === 'O');
        }
    }

    highlightWinningCells() {
        this.winningCells.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    endGame(message) {
        this.gameOver = true;
        document.getElementById('winnerText').textContent = message;
        document.getElementById('winnerModal').style.display = 'flex';
    }

    reset() {
        if (this.connected && this.socket) {
            const resetMessage = {
                type: 'reset'
            };
            this.socket.send(JSON.stringify(resetMessage));
        }
        
        // Hide winner modal
        document.getElementById('winnerModal').style.display = 'none';
    }
}

// Initialize game
let game = new CaroGame();

// Utility functions
function resetGame() {
    game.reset();
}

function showInstructions() {
    alert(`🎯 HƯỚNG DẪN CHƠI CỜ CARO ONLINE

📋 Luật chơi:
• Hai người chơi lần lượt đánh X và O
• Người nào xếp được 5 quân liên tiếp (ngang, dọc, chéo) sẽ thắng
• Click vào ô trống để đánh quân (chỉ khi đến lượt của bạn)

🌐 Chơi Online:
• Mở 2 cửa sổ trình duyệt để chơi với 2 người
• Server sẽ tự động phân người chơi X và O
• Nước đi sẽ được đồng bộ real-time giữa 2 người chơi

🎮 Điều khiển:
• Click chuột: Đánh quân (khi đến lượt)
• Nút "Chơi lại": Bắt đầu ván mới
• Phím R: Chơi lại nhanh

✨ Chúc bạn chơi vui vẻ!`);
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
});