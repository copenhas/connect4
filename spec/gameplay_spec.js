
/*jshint node:true strict:false */
/*globals describe, beforeEach, it, expect */

var Game = require('../app/game').Game;

function createStartedGame() {
    var game = new Game();

    for(var x = 1; x <= 2; x++) {
        game.addPlayer('player' + x);
    }

    game.start();

    return game;
}

describe('after the game has been started', function () {
    var game = null;

    beforeEach(function () {
        game = createStartedGame();
    });

    it('sets the state to the first player to mark whose turn it is',
    function () {
        expect(game.state()).toBe(game.players()[0]);
    });

    it('allows pieces to be placed by the current player', function () {
        expect(function () {
            game.place('some other player', 3);
        }).toThrow(new Error("it is not some other player's turn"));

        game.place('player1', 3);
    });
});

describe('when players are making moves', function () {
    var game = null;

    beforeEach(function () {
        game = createStartedGame();
    });

    it('marks the board when a piece is successfully placed', function () {
        game.place('player1', 3);
        expect(game.board().state[3][0]).toBe('player1');
    });

    it('returns the location the piece landed', function () {
        var loc = game.place('player1', 3);
        expect(loc).toEqual({ x: 3, y: 0 });
    });

    it('changes the state to the next player to mark whose turn it is',
    function () {
        game.place('player1', 3);
        expect(game.state()).toBe('player2');
    });

    it('stacks the pieces if players play the same column', function () {
        game.place('player1', 3);
        game.place('player2', 3);

        expect(game.board().state[3][0]).toBe('player1');
        expect(game.board().state[3][1]).toBe('player2');
    });

    it('throws an error if there are no open slots on a column', function (){
        expect(function () {
            for(var y = 0; y <= game.board().height; y += 2) {
                game.place('player1', 3);
                game.place('player2', 3);
            }
        }).toThrow(new Error('invalid move, column full'));
    });

    it('changes state to "finished" when a player gets 4 in a row', function () {
        for(var x = 0; x < 3; x += 1) {
            game.place('player1', 1);
            game.place('player2', 2);
        }

        game.place('player1', 1);

        expect(game.state()).toBe('finished');
    });
});

describe('when the game has been finished', function () {
    var game = null;

    beforeEach(function () {
        game = createStartedGame();

        for(var x = 0; x < 3; x += 1) {
            game.place('player1', 1);
            game.place('player2', 2);
        }

        game.place('player1', 1);

        expect(game.state()).toBe('finished');
    });

    it('does not allow any more moves', function () {
        expect(function () {
            game.place('player2', 2);
        }).toThrow(new Error('game is over'));
    });

    it('allows you to retrieve the winner', function () {
        expect(game.winner()).toBe('player1');
    });
});
