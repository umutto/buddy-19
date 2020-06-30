var BaseRoom = require("./BaseRoom");

class CustomRoom extends BaseRoom {
  Playlist = null;
  constructor(nsp, args) {
    super(nsp, args);
  }
}

module.exports = CustomRoom;
