// Require dependencies
var express = require('express');
var app = express();
var opener = require('opener');
var fs = require('fs');
var server = require('http').Server(app);
// Start socket.io server using express
var io = require('socket.io')(server);
// Import config
var config = require('./config.json');
var musicFolder = config.musicFolder;

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

// Set client folder as static resource
app.use(express.static('client'));
// Set musicFolder as static resource
app.use(express.static(musicFolder));

// Listen on the port described in the config.json
server.listen(config.serverPort);
opener('http://localhost:' + config.serverPort + '/#/my-view1');
console.log('started at :', config.serverPort);

// Set some variables
var songs;
var player;
var ready;

// Read available songs in the musicFolder
fs.readdir(musicFolder, function(err, files) {
  songs = files;
});

// Listen for connection
io.on('connection', function(socket) {
    console.log('new device connected');
    // Set ready clients to 0
    ready = 0;
    // Send song to connected clients
    sendSong();

    // Listen for socket events.
    // "Req" stand for "request".

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
        // If player isn't already paused, pause it
        if (player.status !== 'paused') {
            pause();
        } else {
            play();
        }

    });
    // Code to be executed when a client finished loading a song
    socket.on('loaded', function() {
        ready++;
        console.log('ready', ready, 'of', io.sockets.server.eio.clientsCount);
        // Check if all clients are ready
        if (ready == io.sockets.server.eio.clientsCount) {
          // Reset the ready variable
          ready = 0;
            console.log('started all perfectly');
            // Finally play the song
            play();
        }
    });


});

function ding() {
  socket.emit('ding');
}

function randomSong() {
    // Return a random song
    return songs[parseInt(Math.random() * songs.length)];
}

function play() {
    io.emit('play');
    player.status = 'playing';
    console.log(player.status);

}

function pause() {
    io.emit('pause');
    player.status = 'paused';
    console.log(player.status);
}

function sendSong() {
    player = {
        current: randomSong(),
        time: 0,
        status: 'paused',
    };
  io.emit('playerData', player);
}

function sync(ms) {
  console.log('sync', ms);
  io.emit('sync', ms);
}
