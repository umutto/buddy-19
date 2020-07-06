var BaseRoom = require("./BaseRoom");

class CustomRoom extends BaseRoom {
  Playlist = null;
  constructor(io, args) {
    super(io, args);
  }
}

module.exports = CustomRoom;
