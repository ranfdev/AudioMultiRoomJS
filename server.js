// Require dependencies
var express = require('express');
var app = express();
var opener = require('opener');
var fs = require('fs');
var server = require('http').Server(app);
// Start socket.io server using express
var io = require('socket.io')(server);

config = require('./config.json');

/**
 * Define the server class
 * 
 * @class Server
 */
class Server {
    /**
     * Creates an instance of Server.
     * @param {string} mode - Start the server in the selected mode: debug or default
     * 
     * @memberof Server
     */
    constructor(mode) {
        this.status = 'paused';
        this.songs = null;
        this.start(mode);
        this.loadSongList = this.loadSongList.bind(this);
        this.randomSong = this.randomSong.bind(this);
        this.sendSong = this.sendSong.bind(this);
        this.onConnection = this.onConnection.bind(this);
        io.on('connection', this.onConnection);
        this.timeToEnd = null;
        
        

    }
    /**
     * load the selected folder
     * 
     * @param {string} path 
     * 
     * @memberof Server
     */
    loadFolder(path) {
        app.use(express.static(path));
    }
    /**
     * load list of available songs
     * 
     * 
     * @memberof Server
     */
    loadSongList() {
        try {
             this.songs = fs.readdirSync(config.musicFolder);
            console.log('songs',this.songs);
        } catch(e) {
            console.log(e);
            this.songs.lenght = 2;
        }
       
    }
    /**
     * open a browser window with the music player interface
     * 
     * 
     * @memberof Server
     */
    openClient() {
        opener('http://localhost:' + config.serverPort);

    }
    /**
     * return the path of a random song
     * 
     * @returns {string} path
     * 
     * @memberof Server
     */
    randomSong() {
        console.log('SELECTING A RANDOM SONG');
        return this.songs[parseInt(Math.random() * this.songs.length)];
    }
    
    /**
     * synchronize all the clients by sending to them the current time of the song
     * 
     * @param {string} ms 
     * 
     * @memberof Server
     */
    sync(ms) {
        console.log('sync', ms);
        io.emit('playerAction', { "sync": ms });
    }
    /**
     * send a pause request to all the clients
     * 
     * 
     * @memberof Server
     */
    pause() {
        io.emit('playerAction', { "pause": "" });
        if (typeof this.timeToEnd != 'undefined') {
            clearTimeout(this.timeToEnd);
        }
        this.status = 'paused';
    }
    /**
     * send a play request to all the clients
     * 
     * 
     * @memberof Server
     */
    play() {
        io.emit('playerAction', { "play": "" });
        this.status = 'playing';
    }
    /**
     * save the configuration received from a client, or set a default configuration
     * 
     * @param {Object} data 
     * 
     * @memberof Server
     */
    saveConfig(data) {
        config = {
            musicFolder: data.musicFolder || 'your-music-folder',
            serverPort: data.serverPort || 3000
        };
        console.log('WRITING CONFIG', config);
        fs.writeFile('config.json', JSON.stringify(config), function (err) { });
    }
    /**
     * send a random song to all the clients
     * 
     * 
     * @memberof Server
     */
    sendSong() {
        io.emit('playerAction', { "loadSong": this.randomSong() });

    }
    /**
     * calc remaining time and send the next song when the earlier finish
     * 
     * @param {Number} time 
     * @returns 
     * 
     * @memberof Server
     */
    calcRemainingTime(time) {
        if (typeof this.timeToEnd != 'undefined') {
            clearTimeout(this.timeToEnd);
        }
        var remainingTime = (time.duration - time.currentTime) * 1000;
        if (remainingTime > 0) {
            this.timeToEnd = setTimeout(this.sendSong, remainingTime);
            console.log('NEXT SONG IN ' + remainingTime / 1000 + 's');
        } else {
            return 0;
        }
    }
    /**
     * start the server in the selected mode: default or debug
     * 
     * @param {String} mode 
     * 
     * @memberof Server
     */
    start(mode) {
        if (mode == 'debug') {
            this.loadFolder('client');
            console.log('started as debug');
        } else {
            this.loadFolder('client/build/default/');
        }
        server.listen(config.serverPort);
        console.log('started at :', config.serverPort);
    }
    rename() {

    }
    /**
     * execute this on a new client connection
     * 
     * @param {any} socket 
     * 
     * @memberof Server
     */
    onConnection(socket) {
        if (config.musicFolder != 'your-music-folder') {
        this.loadFolder(config.musicFolder);
        this.loadSongList();
        this.sendSong();

        }
        console.log('new device connected');
        socket.on('serverAction', (action) => {
            switch (Object.getOwnPropertyNames(action)[0]) {
                case 'sync':
                    this.sync(action.sync.currentTime);
                    this.calcRemainingTime(action.sync);
                    break;
                case 'next':
                    this.sendSong();
                    break;
                case 'pause':
                    // If player isn't already paused, pause it
                    if (this.status !== 'paused') {
                        this.pause();
                    } else {
                        this.play();
                    }
                    console.log(this.status);
                    break;
                case 'ding':
                    socket.emit('playerAction', { "dong": "" });
                    break;
                case 'saveConfig':
                    console.log(action.saveConfig.musicFolder);
                    this.saveConfig(action.saveConfig);
                    this.loadFolder(config.musicFolder);
                    this.loadSongList();
                    this.sendSong();
                    break;
                case 'rename':
                    fs.rename(config.musicFolder + action.rename.before,
                        config.musicFolder + action.rename.after,
                        (error) => {
                            console.log(error);
                        });
                    this.loadFolder(config.musicFolder)
                    this.loadSongList();

            }
        })
    }
    

}
exports.Server = Server;