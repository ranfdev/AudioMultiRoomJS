# MultiRoomJS-server BETA
A simple nodejs server that stream your favourite music.
## How to:
- [install the server](#install-the-server)
- [configure the server](#configure-the-server)
- [start the server](#start-the-server)
- [connect and listen!](#connect-and-listen)

### Install the server
#### Install nodejs and npm
Just google it. It is pre-installed in most linux distros.
#### Download the files
It's really easy, just download the repository by cloning it or downloading the zip.
Then navigate to the folder you have downloaded/extracted the files, open a terminal and type `npm install`.

### Configure the server
Open the file `config.json` and change `your-music-folder` with your folder that contains all your music.
That folder must not contain other folders and must contain only music files.

### Start the server
Type `npm server.js` to start the server

### Connect and listen
Open any browser you want on the device you want to listen the music and go to http://your-server-ip:3000.
your-server-ip is the ip of the machine where your run `npm server.js`
