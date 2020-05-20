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
  }

  getMembers() {
    return this.Members;
  }

  addMember(user_details) {
    this.Members.push(user_details);
    return this.getMemberCount();
  }

  updateMember(user_id, user_details) {
    this.Members[this.Members.findIndex((u) => u.Id === user_id)] = user_details;
  }

  removeMember(user_id) {
    let del_index = this.Members.findIndex((u) => u.Id === user_id);
    this.Members.splice(del_index, 1);
    return this.getMemberCount();
  }

  getMemberCount() {
    return this.getMembers().length;
  }

  getMembersPublicValues() {
    return this.getMembers().map((u) => {
      return { Id: u.Id, Name: u.Name, Avatar: u.Avatar, EnterDate: u.EnterDate };
    });
  }

  onMessage(user, context) {
    if (context.ChatMessage)
      context.ChatMessage.Message = sanitizeHtml(context.ChatMessage.Message);

    let context_echo = {
      User: user,
      ...context,
      TimeReceived: new Date().toJSON(),
    };

    return context_echo;
  }
}

module.exports = BaseRoom;
