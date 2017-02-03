# AudioMultiRoomJS BETA
A simple nodejs server that sync your favourite music. It's easier than you think!
## How to:

- [requirements](#requirements)
- [install the server](#install-the-server)
- [configure the server](#configure-the-server)
- [start the server](#start-the-server)
- [connect and listen!](#connect-and-listen)

### Requirements
The server can be run in linux,mac os and windows.
The client can be used everywhere there is a browser that supports html5 and web components (every latest browser does).

To run the server you need:
* Nodejs
* Npm

### Install the server
It's really easy, just download the latest source code .tar.gz from [here](https://github.com/ranfdev/AudioMultiRoomJS/releases/latest).
Then open a terminal and type `npm install downloaded-file`, where `downloaded-file` is the release you've just downloaded

### Start the server
In the terminal, navigate where you installed the server, by typing `cd ./node_modules/AudioMultiRoomJS/`. Now type `node server.js` to start the server

### Configure the server
##### Method 1 (easy)
Use the settings page in the website
##### Method 2 (hard/manual)
Open the file `config.json` and change `your-music-folder` with your folder that contains all your music.
That folder must not contain other folders and must contain only music files.



### Connect and listen
Open any browser you want on the device you want to listen the music and go to http://your-server-ip:3000.
your-server-ip is the ip of the machine where your run `node server.js`
