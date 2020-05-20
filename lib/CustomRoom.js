var BaseRoom = require("./BaseRoom");

class CustomRoom extends BaseRoom {
  Playlist = null;
  constructor(args) {
    super(args);
  }
}

module.exports = CustomRoom;
