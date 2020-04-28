var socket_io = require("socket.io");
var messageType = require("../helpers/message");

var sqliteController = require("../models/sqlite");

module.exports = {
  io: null,
  init: (server) => {
    if (!this.io)
      this.io = socket_io(server, {
        pingTimeout: 60000,
        transports: ["websocket", "polling"],
      });
    const _this = this;

    this.io.on("connection", function (socket) {
      let conn_client = socket.request._query;
      let room_details = null;

      console.log(
        `(${conn_client.uuid}) has established a connection using socket (${socket.id}).`
      );

      socket.on("join", async function (room, ack) {
        console.log(`(${conn_client.uuid}) is attempting to join room (${room})`);
        room_details = await sqliteController.get_room_details(room);

        try {
          if (!room_details) {
            ack({
              Code: 404,
              Message: `Room (${room}) is not found or not available anymore.`,
            });
          } else if (conn_client.uuid === room_details.Host) {
            // Host has joined/created the room, doesn't need password.
            socket.join(room);
            ack({ Code: 200, Message: room });
            socket.to(room).emit(messageType.userConnected, {
              usr_id: conn_client.uuid,
              usr_name: conn_client.name,
              usr_avatar: conn_client.avatar,
            });
          } else if (!Object.keys(socket.rooms).includes(room)) {
            ack({ Code: 403, Message: `Room (${room}) is waiting for the host.` });
          } else if (room_details.password !== conn_client.password) {
            ack({ Code: 401, Message: "Wrong password." });
          } else {
            socket.join(room);
            ack({ Code: 200, Message: room });
            socket.to(room).emit(messageType.userConnected, {
              usr_id: conn_client.uuid,
              usr_name: conn_client.name,
              usr_avatar: conn_client.avatar,
            });
          }
        } catch (error) {
          ack({
            Code: 500,
            Message: "Something went wrong, try again later.",
            Details: error,
          });
        }
      });

      socket.on("disconnecting", function (reason) {
        let rooms = Object.keys(socket.rooms).filter((k) => k != socket.id);
        rooms.forEach(function (room) {
          _this.io.sockets.in(room).clients((error, clients) => {
            if (error) throw error;
            if (clients.length === 0) {
              socketController.set_room_active(room, false);
              console.log(
                `All users have disconnected from room (${room}), deactivating.`
              );
            }
          });
          socket.to(room).emit(messageType.userDisconnected, {
            usr_id: conn_client.uuid,
          });
        });

        console.log(
          `(${conn_client.uuid}) is closing the connection on socket (${socket.id}) with reason "${reason}".`
        );
      });

      socket.on("message", function (messageType, context, ack) {
        if (socket.room) {
          // echo message after processing
          // socket.to(room).emit(messageType, context);
          ack({ Code: 200, Message: message });
        } else {
          ack({ Code: 404, Message: "User is not a member of any rooms." });
        }
      });
    });
  },
};
