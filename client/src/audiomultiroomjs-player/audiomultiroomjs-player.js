/* jshint esversion: 6 */
  class Myplayer extends Polymer.Element {
    static get is() { return 'audiomultiroomjs-player'; }
    constructor() {
      super();


    }
    static get properties() {
      return {
        prop1: {
          type: String,
          value: 'polymer2-app-app'
        },
        song: {
          type: String,
          value: '',
          observer: '_songChanged'
        }
      };
    }

    connectedCallback() {
      super.connectedCallback();
      // this.onPause.bind(this);
      // this.onPlay.bind(this);
      this.sound = new Audio();
      this.playBtn = this.root.querySelector('.circle');
      this.settingsBtn = this.root.querySelector('#settings');
      this.syncBtn = this.root.querySelector('#sync');
      this.nextBtn = this.root.querySelector('#next');
      this.editBtn = this.root.querySelector('#edit');
      this.saveBtn = this.root.querySelector('#save');
      this.saveConfigBtn = this.root.querySelector('#saveConfig');
      this.app = this.parentNode.host;
      this.folderInput = this.root.querySelector('#folderInput');
      this.songInput = this.root.querySelector('#songInput');
      this.onLoadeddata = this.onLoadeddata.bind(this);
      this.onPause = this.onPause.bind(this);
      this.onPlay = this.onPlay.bind(this);
      this.onSeeked = this.onSeeked.bind(this);
      this._onRename = this._onRename.bind(this);
      this.sync = this.sync.bind(this);
      this.addEventListeners();
    }

    play() {
      this.sound.play();
      setTimeout(this.sync, 1000);
      
    }
    pause() {
      this.sound.pause();
    }
    sync() {
      this.app.time.syncSent = performance.now();
        this.app.socket.emit('serverAction', {"sync": {"currentTime": this.sound.currentTime, "duration": this.sound.duration}});
      console.log('sync')
    }
    onPlay() {
      console.log('playing');
        this.playBtn.classList.add('active');
      
    }
    onPause() {
      console.log('paused');
        this.playBtn.classList.remove('active');
    }
    onSeeked() {
      console.log('seeked');
        this.app.time.playing = performance.now();
        var playdelay = (this.app.time.playing - this.app.time.syncReceived)/1000;
        this.sound.currentTime += playdelay*2;
        this.sound.removeEventListener('seeked', this.onSeeked);
        console.log({
          'syncReceived': this.app.time.syncReceived,
          'playing': this.app.time.playing,
          'playDelay': playdelay,
          'delay': this.app.time.delay
        });
    }
    onLoadeddata() {
        console.log('canplay');
        this.pause();
        this.play();
        // setTimeout(() => {
        // this.sync();        

        // }, Math.random() * 3000 + 2000);
      
    }
    _onFolderChange() {
      this.app.socket.emit('serverAction', {"saveConfig": {"musicFolder": `${this.folderInput.value}`}});
    }
    _onRename(newName) {
      this.app.socket.emit('serverAction', {"rename": {"before": this.song, "after": newName}})
    }
    addEventListeners() {
      this.sound.addEventListener('play',  this.onPlay);
      this.sound.addEventListener('pause',  this.onPause);
      // this.sound.addEventListener('seeked',  this.onSeeked);
      this.sound.addEventListener('loadeddata', this.onLoadeddata);

      this.playBtn.addEventListener('click', () => {
        console.log(this.sound.played);
        if (this.sound.played.length > 0) {
          this.app.socket.emit('serverAction', {"pause": ""});

        } else {
          this.play();
        }


      });
      this.settingsBtn.addEventListener('click', () => {
        this.root.querySelector('.settings').classList.toggle('active');
      });
      this.nextBtn.addEventListener('click', () => {
        this.app.socket.emit('serverAction', {"next": ""});
        this.nextBtn.animate([
          {opacity: 1, transform: 'translateX(0px)'},
          {opacity: 0, transform: 'translateX(30px)'},
          {opacity: 0, transform: 'translateX(-30px)'},
          {opacity: 1, transform: 'translateX(0px)'}
        ], {duration: 300, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'})
      });
      this.syncBtn.addEventListener('click', () => {
        this.sync();        
        this.syncBtn.animate([
          {transform: 'rotateZ(0deg)'},
          {transform: 'rotateZ(-360deg)'},
        ], {duration: 300, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'})
      });
      this.saveConfigBtn.addEventListener('click', () => {
        this._onFolderChange();
        this.root.querySelector('.settings').classList.toggle('active');
        
      });
      this.saveBtn.addEventListener('click', () => {
        this._onRename(this.songInput.value);
        this.root.querySelector('.content').classList.toggle('editing');
        this.song = this.songInput.value;
        
      });
      this.editBtn.addEventListener('click', () => {
        // let content = this.root.querySelector('.content');
        // let childs = this.root.querySelector('.content > *');
        // let initialFlex = content.style.flex;
        // let infos = content.getBoundingClientRect();
        // content.style.flex = '0 0 100%';
        // let infos2 = content.getBoundingClientRect();
        // content.style.flex = initialFlex;
        // let scaleFactor = infos2.height / infos.height;
        // content.style.transform = `scaleY(${scaleFactor})`;
        // childs.style.transform = `scaleY(${1/scaleFactor})`;
        this.root.querySelector('.content').classList.toggle('editing')
      });
    }
    _songChanged(song) {
      if (song.length > 0) {
        console.log('song',song);
        this.song = song;
        this.sound.src = song;
        this.pause();
        this.play();
      }

    }
    get time() {
      return this.sound.currentTime;
    }
    set time(time) {
      this.sound.currentTime = time;
      this.app.time.syncReceived = performance.now();
    }


  }
  window.customElements.define(Myplayer.is, Myplayer);
