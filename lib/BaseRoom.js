var sanitizeHtml = require("sanitize-html");
var messageType = require("../lib/MessageType");

class BaseRoom {
  constructor(args) {
    this.MessageTypes = messageType;

    this.Id = args.Id;
    this.Name = args.Name;
    this.Password = args.Password;
    this.Code = args.PublicUrl;
    this.Members = args.Members || [];
    this.Host = args.Host;
    this.CreationDate = args.CreationDate;
    this.Theme = args.Theme;
    this.Settings = args.Settings;
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

    return {
      User: user,
      TimeReceived: new Date().toJSON(),
    };
  }

  removeMember(user_id, reason) {
    let user = this.Members.find((u) => u.Id === user_id);

    let context_echo = {
      User: user,
      ChatMessage: { Message: `${user.Name} has left the room.` },
      TimeReceived: new Date().toJSON(),
      Reason: reason,
    };

    this.Members.splice(this.Members.indexOf(user), 1);

    return context_echo;
  }

  getMemberCount() {
    return this.getMembers().length;
  }

  getMembersPublicValues() {
    return this.getMembers().map((u) => {
      return { Id: u.Id, Name: u.Name, Avatar: u.Avatar, EnterDate: u.EnterDate };
    });
  }

  onConnect(user) {
    let context_echo = {
      User: user,
      TimeReceived: new Date().toJSON(),
      EnterDate: user.EnterDate,
    };

    return {
      user_context: {
        ...context_echo,
        ChatMessage: { Message: `You have joined the ${this.Name} room!` },
        Members: this.getMembersPublicValues().filter((u) => u.Id !== user.Id),
      },
      room_context: {
        ...context_echo,
        ChatMessage: { Message: `${user.Name} has joined the room!` },
      },
    };
  }

  onMessage(user, type, context) {
    if (context.ChatMessage)
      context.ChatMessage.Message = sanitizeHtml(context.ChatMessage.Message);

    let context_echo = {
      User: user,
      ...context,
      TimeReceived: new Date().toJSON(),
    };

    if (type === this.MessageTypes.roomSettings)
      context_echo.RoomSettings = {
        Type: this.Type,
        Name: this.Name,
        Theme: this.Theme,
        Settings: this.Settings,
      };

    return context_echo;
  }
}

module.exports = BaseRoom;
