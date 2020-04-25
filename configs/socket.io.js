var socket_io = require("socket.io");
var messageType = require("../helpers/message");

module.exports = {
  io: null,
  init: (server) => {
    if (!this.io) this.io = socket_io.listen(server, { pingTimeout: 60000 });

    /////// OLD CODE, NOT WORKING ///////
    // this.io.configure(function () {
    //   this.io.set("transports", ["websocket", "polling"]);
    // });

    // this.io.configure("production", function () {
    //   this.io.set("log level", 1);
    // });

    this.io.sockets.on("connection", function (socket) {
      let conn_client = socket.request._query;

      console.log(`${socket.id} has established a connection.`);

      socket.on("join", function (room, ack) {
        /////// OLD CODE, NOT WORKING ///////
        socket.get("room", function (err, oldRoom) {
          if (oldRoom) {
            socket.leave(oldRoom);
          }
          /////// OLD CODE, NOT WORKING ///////
          socket.set("room", room, function () {
            socket.join(room);
            ack();
          });
        });
      });

      socket.on("disconnect", function () {
        console.log(`${socket.id} has closed the connection.`);
        socket.emit(messageType.userDisconnected, conn_client);
      });

      socket.on("message", function (msg, ack) {
        socket.get("room", function (err, room) {
          if (err) {
            socket.emit("error", err);
          } else if (room) {
            // change functionality
            // socket.broadcast.to(room).emit("broadcast", msg);
            ack();
          } else {
            socket.emit("error", `${room} room is not found`);
          }
        });
      });
    });
  },
};
