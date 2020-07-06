var QuizRoom = require("./QuizRoom");

class SketchRoom extends QuizRoom {
  constructor(io, args) {
    super(io, args);
  }
}

module.exports = SketchRoom;
