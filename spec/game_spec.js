/*jshint node:true strict:false */
/*globals describe, beforeEach, it, expect */

var Game = require('../app/game').Game;

describe('a connect 4 game', function () {
    var game = null;

    beforeEach(function () {
        game = new Game();
    });

    it('has a board', function () {
        expect(game.board()).toBeTruthy();
    });

    it('has a list of players', function () {
        expect(game.players()).toBeTruthy();
    });

    it('has 0 players when created', function () {
        expect(game.players().length).toBe(0);
    });

    it('keeps track of the current game state', function () {
        expect(game.state).toBeDefined();
        expect(typeof game.state).toBe('function');
    });

    it('has a state of "pending" by default', function () {
        expect(game.state()).toBe('pending');
    });

    it('will not let a move happen when the game has not started', function () {
        expect(function () {
            game.place('player1', 3);
        }).toThrow(new Error('Game has not started'));
    });

    it('allows players to join', function () {
        game.addPlayer('player1');
        expect(game.players().length).toBe(1);
    });

    it('does not allow game to start with 0 or 1 players', function () {
        var start = function () {
            game.start();
        };

        expect(start).toThrow(new Error('not enough players'));

        game.addPlayer('player1');
        expect(start).toThrow(new Error('not enough players'));
    });

    it('allows a game to start when there are 2 players', function () {
        for(var x = 1; x <= 2; x++) {
            game.addPlayer('player' + x);
        }

        game.start();
    });

});
