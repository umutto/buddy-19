var BaseRoom = require("./BaseRoom");

class YoutubeRoom extends BaseRoom {
  Playlist = null;
  constructor(args) {
    super(args);
    this.Playlist = this.Playlist;
  }

  onMessage(user, type, context) {
    let echo = super.onMessage(user, context);
    // if (type === this.MessageTypes.roomControl) // do something;
    return echo;
  }
}

module.exports = YoutubeRoom;
