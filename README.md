# MultiRoomJS-server BETA
A simple nodejs server that stream your favourite music.
## How to:
- [requirements](#requirements)
- [install the server](#install-the-server)
- [configure the server](#configure-the-server)
- [start the server](#start-the-server)
- [connect and listen!](#connect-and-listen)

### Requirements
The server can be run in linux,mac os and windows.
The client can be used everywhere there is a browser that supports html5 (every latest browser does).

To run the server you also need:
* Nodejs
* Npm
* Bower



### Install the server
It's really easy, just download the repository by cloning it or downloading the zip.
Then navigate to the folder you have downloaded/extracted the files, open a terminal and type `npm install`. Then `cd` to the client folder and type `bower install`.

### Configure the server
Open the file `config.json` and change `your-music-folder` with your folder that contains all your music.
That folder must not contain other folders and must contain only music files.

### Start the server
Type `node server.js` to start the server

### Connect and listen
Open any browser you want on the device you want to listen the music and go to http://your-server-ip:3000.
your-server-ip is the ip of the machine where your run `node server.js`
