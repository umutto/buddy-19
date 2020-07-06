var sanitizeHtml = require("sanitize-html");
var messageType = require("../lib/MessageType");

class BaseRoom {
  MessageHistory = [];
  constructor(io, args) {
    this.MessageTypes = messageType;

    this.io = io;

    this.Name = args.Name;
    this.Password = args.Password;
    this.Code = args.PublicUrl;
    this.Members = args.Members || [];
    this.Host = args.Host;
    this.CreationDate = args.CreationDate;
    this.Theme = args.Theme;
    this.Settings = args.Settings;
  }

  sendSocketMessage(user, type, context) {
    let message_source = user
      ? this.io.of("/").connected[user.SocketId].to(this.Code)
      : this.io.in(this.Code);

    return message_source.emit("message_echo", type, context);
  }

  editRoomDetails(user, settings) {
    this.Theme = settings.Theme || this.Theme;
    this.Name = settings.Name || this.Name;

    let echo = {
      User: this.getMemberPublicValues(user),
      TimeReceived: new Date().toJSON(),
      ...settings,
    };

    this.sendSocketMessage(user, messageType.roomDetails, {
      ...echo,
      ChatMessage: { Message: `${user.Name} has updated room settings.` },
    });

    return {
      ...echo,
      ChatMessage: { Message: `You have updated the room settings.` },
    };
  }

  getMembers() {
    return this.Members;
  }

  addMember(user) {
    this.Members.push(user);
    return this.getMemberCount();
  }

  updateMember(user_id, user) {
    this.Members[this.Members.findIndex((u) => u.Id === user_id)] = user;

    let echo = {
      User: this.getMemberPublicValues(user),
      TimeReceived: new Date().toJSON(),
    };

    this.sendSocketMessage(user, messageType.userDetails, {
      ...echo,
      ChatMessage: { Message: `${user.Name} has updated their profile.` },
    });

    return {
      ...echo,
      ChatMessage: { Message: `You have updated your profile.` },
    };
  }

  removeMember(user_id, reason) {
    let user = this.Members.find((u) => u.Id === user_id);

    let context_echo = {
      User: this.getMemberPublicValues(user),
      ChatMessage: { Message: `${user.Name} has left the room.` },
      TimeReceived: new Date().toJSON(),
      Reason: reason,
    };

    this.Members.splice(this.Members.indexOf(user), 1);

    this.sendSocketMessage(user, messageType.userDisconnected, context_echo);

    return context_echo;
  }

  getMemberCount() {
    return this.getMembers().length;
  }

  getMemberPublicValues(user) {
    // if a user id is given, find the matching user
    if (isNaN(user) ? !1 : ((x = parseFloat(user)), (0 | x) === x))
      user = this.getMembers().filter((u) => u.Id === id);

    return user
      ? {
          Id: user.Id,
          Name: user.Name,
          Avatar: user.Avatar,
          EnterDate: user.EnterDate,
        }
      : null;
  }

  getMembersPublicValues() {
    return this.getMembers().map((u) => {
      return { Id: u.Id, Name: u.Name, Avatar: u.Avatar, EnterDate: u.EnterDate };
    });
  }

  onConnect(user) {
    this.addMember(user);

    let context_echo = {
      User: this.getMemberPublicValues(user),
      TimeReceived: new Date().toJSON(),
      EnterDate: user.EnterDate,
    };

    // announce user to room
    this.sendSocketMessage(user, messageType.userConnected, {
      ...context_echo,
      ChatMessage: { Message: `${user.Name} has joined the room!` },
    });

    return {
      ...context_echo,
      ChatMessage: { Message: `You have joined the ${this.Name} room!` },
      Members: this.getMembersPublicValues().filter((u) => u.Id !== user.Id),
    };
  }

  onMessage(user, type, context) {
    this.MessageHistory.push({
      User: user.Id,
      Type: type,
      TimeReceived: new Date().toJSON(),
      Context: context,
    });

    if (context.ChatMessage)
      context.ChatMessage.Message = sanitizeHtml(context.ChatMessage.Message);
    let context_echo = {
      User: this.getMemberPublicValues(user),
      ...context,
      TimeReceived: new Date().toJSON(),
    };

    this.sendSocketMessage(user, type, context_echo);

    return context_echo;
  }
}

module.exports = BaseRoom;
