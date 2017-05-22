/* jshint esversion: 6 */
  class MyApplication extends Polymer.Element {
    static get is() { return 'polymer2-app-app'; }
    static get properties() {
      return {
        prop1: {
          type: String,
          value: 'polymer2-app-app'
        }
      };
    }
    constructor() {
      super();
      
    }
    connectedCallback() {
      super.connectedCallback();
      let self = this;
      this.time = {
        ding: null,
        dong: null,
        seekStart: null,
        seekEnd: null,
        delay: null
      }
      let player = self.root.querySelector('audiomultiroomjs-player');
      self.host = window.location.origin;
      self.socket = io.connect(self.host);
      self.socket.on('playerAction', (action) => {
        // console.log(action);
        let parsedAction = action;
        // console.log(Object.getOwnPropertyNames(parsedAction)[0]);
        switch (Object.getOwnPropertyNames(parsedAction)[0]) {
          case 'sync':
            player.sound.addEventListener('seeked',  player.onSeeked);
            player.time = parsedAction.sync + this.time.delay;

            break;
          case 'play':
            player.play();
            break;
          case 'pause':
            player.pause();
            break;
          case 'dong':
            self.time.dong = performance.now();
            self.time.delay = (self.time.dong - self.time.ding) * 0.5 / 1000;
            setTimeout(self.ding.bind(self),10000);
            break;
          case 'loadSong':
            player.song = parsedAction.loadSong;
            break;
        }
      });
        self.ding();
    }
    ding() {
      this.time.ding = performance.now();
      this.socket.emit('serverAction', {"ding": ""});
      console.log('ding')
    }


  }

  window.customElements.define(MyApplication.is, MyApplication);
