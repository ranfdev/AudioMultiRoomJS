// Require dependencies
var express = require('express');
var app = express();
var opener = require('opener');
var fs = require('fs');
var server = require('http').Server(app);
// Start socket.io server using express
var io = require('socket.io')(server);

config = require('./config.json');




// Define some functions

function loadClientFolder(path) {
  // Set client folder as static resource
  app.use(express.static(path));
  openClient();

}

function loadMusicFolder() {
  // Set musicFolder as static resource
  console.log('LOADING FOLDER', config.musicFolder);
  app.use(express.static(config.musicFolder));
  loadSongList();
}

function loadSongList() {
  fs.readdir(config.musicFolder, function(err, files) {
    songs = files;
  });
}

function checkSongList() {
  console.log('CHECHING SONG LIST....');
  if (typeof songs != 'undefined') {
    return true;
  } else {
    return false;
  }
}

function saveConfig(data) {
      config = {
        musicFolder: data.musicFolder || 'your-music-folder',
        serverPort: data.serverPort || 3000
      };
      console.log('WRITING CONFIG', config);
  fs.writeFile('config.json', JSON.stringify(config), function (err) {});
}

function openClient() {
  // Use music folder and play music if the folder is available
  if (config.musicFolder != 'your-music-folder') {
    loadMusicFolder();
    // Open player page
    opener('http://localhost:' + config.serverPort);
  } else {
    // Open settings page
    opener('http://localhost:' + config.serverPort + '#/view2');
  }
}



io.on('connection', onConnection);


// Listen for connection
function onConnection(socket) {
  console.log('new device connected');
  // Set ready clients to 0
  ready = 0;

  sendSong();

  // Listen for socket events.
  // "Req" stand for "request".

  socket.on('syncReq', function(time) {
    sync(time.current);
    calcRemainingTime(time);
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
  socket.on('config', function (data) {
    saveConfig(data);
    loadMusicFolder();
    sendSong();
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
      // ready++;
      // console.log('ready', ready, 'of', io.sockets.server.eio.clientsCount);
      // Check if all clients are ready
      // if (ready == io.sockets.server.eio.clientsCount) {
        // Reset the ready variable
        // ready = 0;
          console.log('started all perfectly');
          // Finally play the song
          play();
      // }
  });


  function ding() {
    socket.emit('ding');
  }

  function randomSong() {
    // Return a random song
    console.log('SELECTING A RANDOM SONG');
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
    if (typeof onSongFinish != 'undefined') {
      clearTimeout(onSongFinish);
    }

    console.log(player.status);
  }

  function sendSong() {
      if (checkSongList() === true) {
        console.log('SENDING SONG');
        player = {
          current: randomSong(),
          status: 'paused',
        };
        io.emit('playerData', player);
      } else {
        console.log('FAILED TO LOAD SONGS');
      }

  }

  function calcRemainingTime(time) {
    if (typeof onSongFinish !== undefined) {
      clearTimeout(onSongFinish);
    }
    var remainingTime = (time.duration - time.current)*1000;
    if (remainingTime > 0) {
      onSongFinish = setTimeout(sendSong,remainingTime);
      console.log('NEXT SONG IN ' + remainingTime/1000 + 's');
    } else {
      return 0;
    }
  }

  function sync(ms) {
    

      console.log('sync', ms);
      io.emit('sync', ms);


  }


}

function start(mode) {
  // var mode = mode || 'production';
  // Set some variables
  var player;
  var ready;
  if (mode == 'debug') {
    loadClientFolder('client');
    console.log('started as debug');
  } else {
    loadClientFolder('client/build/bundled/');
  }


  // loadMusicFolder();
  // loadSongList();
  // Listen on the port described in the config.json
  server.listen(config.serverPort);
  console.log('started at :', config.serverPort);

}
exports.start = start;
