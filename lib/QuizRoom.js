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

  QuestionHistory = [];
  constructor(io, args) {
    super(io, args);
    this.DoublePointsOnLastRound = args.DoublePointsOnLastRound || true;
    this.NumberOfRounds = args.NumberOfRounds || 3;
    this.TurnLimit = args.TurnLimit || 60;
    this.TurnEndsAfter = args.TurnEndsAfter || 0;
  }

  onConnect(user) {
    let user_context = super.onConnect(user);

    return {
      ...user_context,
      CurrentRound: this.CurrentRound,
      CurrentTurn: this.CurrentTurn,
      CurrentQuizMaster: this.CurrentQuizMaster,
      CurrentTurnTimer: this.CurrentTurnTimer,
    };
  }

  onMessage(user, type, context) {
    let user_context = super.onMessage(user, type, context);

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
        let echo = {
          Round: this.CurrentRound,
          Turn: this.CurrentTurn,
          TimeReceived: new Date().toJSON(),
        };

        this.sendSocketMessage(user, type, {
          ...echo,
          Question: {
            Body: context.Question.Body,
            Type: context.Question.Type,
            AcceptedVals: context.Question.AcceptedVals,
          },
          User: this.getMemberPublicValues(user),
        });

        let interval = this.setMessageTimer(
          context.QuestionTimer || this.TurnLimit,
          1,
          function () {
            // Send message to all room users (including author, sendSocketMessage with user = null) for times up, send the answer, and show the results
            console.log(`(${this.CurrentRound}/${this.CurrentTurn}) Times up!`);
          }
        );
        this.QuestionHistory.push({
          ...echo,
          Question: context.Question,
          User: user.Id,
          Answers: {},
          TimerId: interval,
        });
      } else if (context.Command === "submitAnswer") {
        // add answer to QuestionHistory
      }
    }

    return user_context;
  }

  setMessageTimer(time, repeat = 1, cb = null) {
    time = time || NumberOfRounds * 1000;
    var interval = setInterval(function () {
      if (cb) cb();
      if (--repeat === 0) clearInterval(interval);
    }, time);
    return interval;
  }
}

module.exports = QuizRoom;
