var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var config = require('./config.json');
var musicFolder = config.musicFolder;
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.static('client'));
app.use(express.static(musicFolder));
// Add headers
// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');
//
//     // // Request methods you wish to allow
//     // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // // Set to true if you need the website to include cookies in the requests sent
//     // // to the API (e.g. in case you use sessions)
//     // res.setHeader('Access-Control-Allow-Credentials', true);
//
//     // Pass to next layer of middleware
//     next();
// });
server.listen(config.serverPort);

var songs;
var player;
var delays = [];
var synced = 0;
var precision = 0.5;

fs.readdir(musicFolder, function(err, files) {
  songs = files;
});

var ready;
io.on('connection', function(socket) {
    synced = 0;
    sendSong();
    function ding() {
      socket.emit('ding');
    }
    console.log('connected');
    socket.on('syncReq', function(ms) {
      sync(ms);
    });
    socket.on('nextReq', function() {
      sendSong();
    });
    socket.on('restartReq', function() {
        console.log('received restart req');
        io.emit('restart');
    });
    socket.on('dingReq', function() {
        ding();
    });
    socket.on('ding', function () {
      socket.emit('dong');
    });
    socket.on('pauseReq', function() {
        if (player.status !== 'paused') {
            pause();
        } else {
            play();
        }

    });
    socket.on('loaded', function() {
        ready++;
        console.log('pronti', ready, 'totali', io.sockets.server.eio.clientsCount);
        if (ready == io.sockets.server.eio.clientsCount) {
          ready = 0;
            console.log('started perfectly');
            play();
        }
    });


});

function randomSong() {
    return songs[parseInt(Math.random() * songs.length)];
}

function play() {
    io.emit('play');
    player.status = 'playing';
    console.log(player.status);
    // sync();
}

function pause() {
    io.emit('pause');
    player.status = 'paused';
    console.log(player.status);
}

function sendSong() {
  ready = 0;
  if (typeof player != 'undefined') {
    console.log('loading preloaded');
    player.current = player.next;
    player.next = randomSong();
  } else {
    player = {
        current: randomSong(),
        time: 0,
        status: 'paused',
        next: randomSong()
    };
  }
  io.emit('playerData', player);
}

function sync(ms) {
  console.log('sync', ms);
  io.emit('sync', ms);
}
