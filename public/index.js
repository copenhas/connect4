/*globals require, io  */
$(function () {
    "use strict";

    var socket = io.connect(),
        playerid,
        gameid,
        canvas = $('#game')[0],
        context = canvas.getContext('2d'),
        board = [],
        state = '',
        space = {
            width: Math.round(canvas.width / 7),
            height: Math.round(canvas.height / 6)
        };

    for(var x = 0; x < 7; x++) {
        var current = board[x] = [];

        for(var y = 0; y < 6; y++) {
            current[y] = null;
        }
    }

    function initBoard() {
        var x,
            y,
            current;

        context.setStrokeColor('black');

        for(x = 0; x < board.length; x++) {
            current = board[x];

            for(y = 0; y < current.length; y++) {
                context.strokeRect(x * space.width,
                                   y * space.height,
                                   space.width,
                                   space.height);
            }
        }
    }

    function drawPiece(color, loc) {
        context.setFillColor(color);
        
        context.fillRect(loc.x * space.width,
                           loc.y * space.height,
                           space.width,
                           space.height);
    }

    canvas.addEventListener('click', function (e) {
        if (state === 'wait') {
            alert('not your turn');
            return;
        }

        var x = Math.floor(e.offsetX / space.width);

        socket.emit('move', {
            playerid: playerid,
            gameid: gameid,
            col: x
        });
        
    }, false);

    socket.on('created', function (data) {
        playerid = data.playerid;
        gameid = data.gameid;
        $('#gameid').text(data.gameid);
    });

    socket.on('joined', function (data) {
        playerid = data.playerid;
        gameid = data.gameid;
        $('#gameid').text(data.gameid);
    });

    socket.on('started', function (turn) {
        initBoard();

        if (turn === playerid) {
            state = 'go';
            $('#state').text('Your turn');
        }
        else{
            state = 'wait';
            $('#state').text('Waiting on other player');
        }
    });

    socket.on('move-success', function (move) {
        drawPiece('red', move);
        state = 'wait';
        $('#state').text('Waiting on other player');
    });

    socket.on('turn', function (lastMove) {
        drawPiece('yellow', lastMove);
        state = 'go';
        $('#state').text('Your turn');
    });

    socket.on('finished', function (data) {
        if (data.winner === playerid) {
            alert('You won');
        }
        else {
            drawPiece('yellow', data.move);
            alert('You lost');
        }
    });

    $('#create').click(function () {
        $('#gameselect').hide();
        socket.emit('create');
    });

    $('#join').click(function () {
        socket.emit('join', $('#joinid').val());
        $('#gameselect').hide();
    });

});
