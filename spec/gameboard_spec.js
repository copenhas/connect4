/*jshint node:true strict:false */
/*globals describe, beforeEach, it, expect */

var Game = require('../app/game').Game;

describe('a connect 4 game board', function () {
    var game = null,
        board = null;

    beforeEach(function () {
        game = new Game();
        board = game.board();
    });

    it('is 6 tall and 7 wide', function () {
        expect(board.width).toBe(7);
        expect(board.height).toBe(6);
    });

    it("can retrieve a space's current state", function () {
        expect(board.state[0][3]).toBeFalsy();
    });

    it('allows you to iterate over the board state', function () {
        var count = 0,
            counter = function (space) {
                count += 1;

                expect(space.x).toBeDefined();
                expect(space.y).toBeDefined();
                expect(space.state).toBeDefined();
            };

        board.forEach(counter);

        expect(count).toEqual(board.width * board.height);
    });
});
