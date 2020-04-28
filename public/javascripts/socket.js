const socketController = {
  messageType: {
    userConnected: 0,
    userDisconnected: 1,
  },
  socket: null,
  init: function () {
    if (this.socket) return this.socket;

    this.socket = io.connect("/", {
      query: serialize_params({
        uuid: c_user_alias,
        date: new Date().toJSON(),
        message_type: this.messageType.userConnected,
        source: window.location.pathname,
      }),
    });
  },
  connect: function (room) {
    if (!this.socket) this.init();

    this.socket.emit("join", room, function (response) {
      if (response.Code === 200) {
        console.log(`You have successfully joined to ${response.Message}!`);
        this.room = room;
      } else {
        console.log(response.Message);
      }
    });
  },
  emit: function (context) {
    if (!this.socket) this.init();
    context.user_id = c_user_alias;

    // this.socket.emit("message", this.room, function () {
    // });
  },
};
