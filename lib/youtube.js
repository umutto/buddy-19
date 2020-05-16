var BaseRoom = require("./BasePageHandler.js");

class YoutubeRoom extends BaseRoom {
  Playlist = null;
  constructor(id, name, members, playlist = {}) {
    super(id, name, members);
    this.Playlist = this.Playlist;
  }
}

module.exports(YoutubeRoom);
