/*jshint node:true strict:false */

exports.Game = function () {
    this._board = [];
    this._width = 7;
    this._height = 6;
    this._state = 'pending';
    this._players = [];

    var self = this;
    (function initBoard() {
        for (var x = 0; x < self._width; x += 1) {
            self._board[x] = [];

            for (var y = 0; y < self._height; y += 1) {
                self._board[x][y] = null;
            }
        }
    }());
};

exports.Game.prototype = {
    addPlayer: function (player) {
        this._players.push(player);
    },

    players: function () {
        return this._players;
    },

    winner: function () {
        return this._winner;
    },

    board: function () {
        return {
            width: this._width,
            height: this._height,
            state: this._board.slice(),
            forEach: function (callback) {
                for (var x = 0; x < this.width; x++) {
                    for (var y = 0; y < this.height; y++) {
                        callback({
                            x: x,
                            y: y,
                            state: this.state[x][y]
                        });
                    }
                }
            }
        };
    },

    state: function () {
        return this._state;
    },

    start: function () {
        if (this._players.length < 2) {
            throw new Error('not enough players');
        }

        this._state = this._players[0];
    },

    place: function (player, column) {
        if (this._state === 'pending') {
            throw new Error('Game has not started');
        }

        if (this._state === 'finished') {
            throw new Error('game is over');
        }

        if (this._state !== player) {
            throw new Error("it is not " + player + "'s turn");
        }

        var playerIndex = this._players.indexOf(player),
            self = this;

        var loc = (function setboard() {
            var y = 0,
                currentCol = self._board[column];

            for(; y < self._height; y++) {
                if (currentCol[y] === null) {
                    currentCol[y] = player;
                    return { x: column, y: y };
                }
            }

            throw new Error('invalid move, column full');
        }());

        if (playerIndex === (this._players.length - 1)){
            this._state = this._players[0];
        }
        else {
            this._state = this._players[playerIndex + 1];
        }

        if (this.hasWon(player)) {
            this._state = 'finished';
            this._winner = player;
        }

        return loc;
    },

    hasWon: function (player) {
        var board = this.board(),
            playersMoves = {},
            addMove = function (space, moves) {
                var key = space.x + "-" + space.y;
                space.adjacents = [];
                moves[key] = space;
            },
            buildAdjacents = function (space, moves) {
                var adjacents = [
                    space.x + "-" + (space.y - 1), //north
                    (space.x + 1) + "-" + (space.y - 1), //northeast
                    (space.x + 1) + "-" + space.y, //east
                    (space.x + 1) + "-" + (space.y + 1) //southeast
                ];

                adjacents.forEach(function (adjKey, index) {
                    if (!playersMoves[adjKey]) {
                        return;
                    }

                    playersMoves[adjKey].adjacents[index] = space;
                });
            },
            navigateSeries = function navigateSeries(space, direction, series) {
                var adjacent = space.adjacents[direction];
                    series = series || [space];

                if (adjacent) {
                    series.push(adjacent);
                    return navigateSeries(adjacent, direction, series);
                }

                return series;
            },
            findLongestSeries = function (space) {
                var max = 4, //adjacents.length north-southeast
                    longest = [],
                    direction,
                    series;

                for(direction = 0; direction < max; direction++) {
                    series = navigateSeries(space, direction);

                    if (longest.length < series.length) {
                        longest = series;
                    }
                }

                return longest;
            };

        //first add all the moves as a disconnected series of nodes
        board.forEach(function (space) {
            if (space.state === player) {
                addMove(space, playersMoves);
            }
        });

        //then build a directed graph out of them
        (function () {
            for(var key in playersMoves) {
                if (playersMoves.hasOwnProperty(key)) {
                    buildAdjacents(playersMoves[key], playersMoves);
                }
            }
        }());

        //look for a 4 long series
        return (function () {
            var space,
                move,
                series;

            for(move in playersMoves) {
                if (playersMoves.hasOwnProperty(move)) {
                    space = playersMoves[move];
                    series = findLongestSeries(space);

                    if(series.length === 4) {
                        return true;
                    }
                }
            }

            return false;
        }());
    }
};
