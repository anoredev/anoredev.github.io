class Player {
    constructor(name, sign) {
        this.name = name;
        this.sign = sign;
        this.wins = 0;
        this.loses = 0;
    }
}

class Cell {
    constructor() {
        this.isEmpty = true;
        this.isCombo = false;
        this.player = false;
    }
}


class Game {
    constructor(width, height, players) {
        this.width = width;
        this.height = height;
        this.players = players;
        this.start();
    }

    start() {
        this.gameOver = false;
        this.playerIndex = 0;
        this.currentPlayer = this.players[this.playerIndex];
        this.matrix = [...new Array(this.height)].map(() => [...new Array(this.width)].map(() => new Cell()));
    }

    nextPlayer() {
        this.playerIndex = this.playerIndex === this.players.length - 1 ? 0 : this.playerIndex + 1;
        this.currentPlayer = this.players[this.playerIndex];
    }

    add(x, y) {
        let cell = this.matrix[y][x];
        if (cell.player) {
            return {
                busy: true,
                player: cell.player
            };
        }
        cell.isEmpty = false;
        cell.player = this.currentPlayer;
        this.nextPlayer();
        return {};
    }

    isLineClear(line) {
        return line.every(e => line[0].player && e.player === line[0].player);
    }

    setCombo(line) {
        line.forEach(cell => {
            cell.isCombo = true;
        })
    }

    update() {
        let matrix = this.matrix;
        let winner;

        /* Row checking */
        for (let row of matrix) {
            if (this.isLineClear(row)) {
                this.setCombo(row);
                winner = row[0].player;
            }
        }

        /* Column checking */
        for (let column of matrix[0].map((_, i) => matrix.map(r => r[i]))) {
            if (this.isLineClear(column)) {
                this.setCombo(column);
                winner = column[0].player;
            }
        }
        
        if (this.width === this.height) {
            /* Diagonals checking */
            for (let diagonal of [matrix.map((r, i) => r[i]), matrix.map((r, i) => r[matrix.length - i - 1])]) {
                if (this.isLineClear(diagonal)) {
                    this.setCombo(diagonal);
                    winner = diagonal[0].player;
                }
            }
        }

        if (winner || matrix.every(row => row.every(cell => cell.player))) {
            this.gameOver = true;
            return winner ? { winner: winner } : { draw: true };
        } else {
            return {};
        }
    }
}

class UI {
    constructor(game, container) {
        let gameField = document.createElement('div');
        gameField.id = 'game-field';
        container.appendChild(gameField);

        let rule = document.styleSheets[0].cssRules[4];
        rule.style.gridTemplateColumns = `repeat(${game.width}, 1fr)`;

        let cells = [...new Array(game.height)].map(() => [...new Array(game.width)].map(() => document.createElement('div')));
        cells.forEach((row, i) => {
            let rowElement = document.createElement('div');
            rowElement.classList.add('game-row');
            gameField.appendChild(rowElement);
            row.forEach((cell, j) => {
                cell.classList.add('game-cell');
                cell.onclick = () => {
                    if (game.gameOver) {
                        showStatus("Игра окончена");
                    } else {
                        let status = game.add(j, i);
                        if (status.busy) {
                            cell.classList.add('game-cell-alert');
                            setTimeout(() => cell.classList.remove('game-cell-alert'), 300);
                        }
                        this.update();
                    }
                };
                rowElement.appendChild(cell);
            });
        });

        this.game = game;
        this.gameField = gameField;
        this.cells = cells;
    }

    update() {
        let state = this.game.update();
        if (state.winner) {
            showStatus(`Игрок ${state.winner.name} победил!`);
        } else if (state.draw) {
            showStatus(`Ничья!`);
        }
        this.cells.forEach((row, i) => {
            row.forEach((cell, j) => {
                let stateCell = this.game.matrix[i][j];
                console.log(stateCell);
                if (!stateCell.isEmpty) {
                    let player = stateCell.player;
                    cell.innerText = player.sign;
                    cell.classList.add('game-cell-busy');
                    if (stateCell.isCombo) {
                        cell.classList.add('game-cell-combo');
                    }
                }
            });
        });
    }

    restart() {
        this.game.start();
        this.cells.forEach(row => row.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('game-cell-busy');
            cell.classList.remove('game-cell-combo');
        }));
    }
}