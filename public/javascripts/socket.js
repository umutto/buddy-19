socketController = {
  messageType: {
    userConnected: 0,
    userDisconnected: 1,
  },
  socket: null,
  init: function () {
    if (this.socket) return this.socket;

    this.socket = io.connect(window.location.origin, {
      query: serialize_params({
        date: new Date().toJSON(),
        message_type: this.messageType.userConnected,
        source: window.location.pathname,
      }),
    });
  },
  connect: function (room) {
    if (!this.socket) this.init();
    this.socket.emit("join", room, function () {
      console.log(`You have successfully joined to ${room}!`);
      this.room = room;
    });
  },
};
