var BaseRoom = require("./BaseRoom");

class QuizRoom extends BaseRoom {
  DoublePointsOnLastRound = null;
  NumberOfRounds = null;
  TurnLimit = null;
  TurnEndsAfter = null;

  CurrentRound = 0;
  CurrentTurn = 0;
  CurrentQuizMaster = null;
  CurrentTurnTimer = 0;
  constructor(nsp, args) {
    super(nsp, args);
    this.DoublePointsOnLastRound = args.DoublePointsOnLastRound || true;
    this.NumberOfRounds = args.NumberOfRounds || 3;
    this.TurnLimit = args.TurnLimit || 60;
    this.TurnEndsAfter = args.TurnEndsAfter || 0;
  }

  onConnect(user) {
    let { user_context, room_context } = super.onConnect(user);

    return {
      user_context: {
        ...user_context,
        CurrentRound: this.CurrentRound,
        CurrentTurn: this.CurrentTurn,
        CurrentQuizMaster: this.CurrentQuizMaster,
        CurrentTurnTimer: this.CurrentTurnTimer,
      },
      room_context,
    };
  }

  onMessage(user, type, context) {
    let { user_context, room_context } = super.onMessage(user, type, context);

    if (type === this.MessageTypes.syncRequest) {
      user_context = {
        ...user_context,
        CurrentRound: this.CurrentRound,
        CurrentTurn: this.CurrentTurn,
        CurrentQuizMaster: this.CurrentQuizMaster,
        CurrentTurnTimer: this.CurrentTurnTimer,
      };
    } else if (type === this.MessageTypes.roomControl) {
      if (context.Command === "submitQuestion") {
      } else if (context.Command === "submitAnswer") {
      }
    }

    return {
      user_context: user_context,
      room_context: room_context,
    };
  }
}

module.exports = QuizRoom;
