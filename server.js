/*jshint node:true strict:false */

var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    guid = require('guid'),
    connect4 = require('./app/game'),
    games = {},
    players = {};

app.listen(8080);

app.get('/', function (req, res) {
    res.sendfile('public/index.html');
});

app.get('/static/:file', function (req, res) {
    res.sendfile('public/' + req.params.file);
});

app.get('/lib/:file', function (req, res) {
    res.sendfile('lib/' + req.params.file);
});

io.sockets.on('connection', function (socket) {
    socket.on('create', function () {
        var gameid = guid.create().toString(),
            playerid = guid.create().toString();

        games[gameid] = new connect4.Game();
        games[gameid].addPlayer(playerid);

        players[playerid] = socket;

        socket.emit('created', { gameid: gameid, playerid: playerid });
    });

    socket.on('join', function (gameid) {
        var playerid = guid.create().toString(),
            game = games[gameid];

        game.addPlayer(playerid);

        socket.emit('joined', { gameid: gameid, playerid: playerid });

        game.start();

        players[playerid] = socket;

        game.players().forEach(function (player) {
            players[player].emit('started', game.state());
        });
    });

    socket.on('move', function (move) {
        var playerid = move.playerid,
            gameid = move.gameid,
            column = move.col,
            game = games[gameid];

        var loc = game.place(playerid, column);
        socket.emit('move-success', loc);

        if (game.state() === 'finished') {
            game.players().forEach(function (player) {
                players[player].emit('finished', {
                    winner: game.winner(),
                    move: loc
                });

                delete players[player];
            });

            delete games[gameid];
        }
        else {
            players[game.state()].emit('turn', loc);
        }
    });

    socket.on('disconnect', function () {
       //need to clean up the kill the game 
    });
});

