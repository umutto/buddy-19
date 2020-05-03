var socket_io = require("socket.io");
var sqliteController = require("../models/sqlite");

const messageType = {
  userConnected: 0,
  userDisconnected: 1,
  userChatMessage: 2,
  userChatReaction: 3,
};

const init = (server) => {
  const io = socket_io(server, {
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  io.on("connection", function (socket) {
    let conn_client = socket.request._query;
    let user_details = {
      UserId: conn_client.UserId,
      UserName: conn_client.UserName || "Guest-" + Math.floor(Math.random() * 10000),
      UserAvatar: conn_client.UserAvatar || "",
    };
    let room_details = null;

    console.log(
      `(${user_details.UserId}) has established a connection using socket (${socket.id}).`
    );

    socket.on("join", async function (room, ack = () => {}) {
      console.log(`(${user_details.UserId}) is attempting to join room (${room})`);

      try {
        room_details = await sqliteController.get_room_details(room);
        room_details.Settings = JSON.parse(room_details.Settings);
        if (!room_details) {
          ack({
            status: 404,
            message: `Room (${room}) is not found or not available anymore.`,
          });
        } else if (user_details.UserId === room_details.Host) {
          // Host has joined/created the room, doesn't need password.
          socket.join(room);
          ack({ status: 200, message: room });
          socket.to(room).emit("message_echo", messageType.userConnected, {
            ...user_details,
            ChatMessage: `${user_details.UserName} has joined the room!`,
            TimeReceived: new Date().toJSON(),
          });
        } else if (room_details.password !== conn_client.password) {
          ack({ status: 401, message: "Wrong password." });
        } else {
          socket.join(room);
          ack({ status: 200, message: room });
          socket.to(room).emit("message_echo", messageType.userConnected, {
            ...user_details,
            ChatMessage: `${user_details.UserName} has joined the room!`,
            TimeReceived: new Date().toJSON(),
          });
        }
      } catch (error) {
        ack({
          status: 500,
          message: "Something went wrong, try again later.",
          details: error,
        });
      }

      socket.on("message", function (message_type, context, ack = () => {}) {
        let context_echo = {
          ...user_details,
          ...context,
          TimeReceived: new Date().toJSON(),
        };
        socket.to(room).emit("message_echo", message_type, context_echo);
        ack({ status: 200, message: context_echo });
      });
    });

    socket.on("disconnecting", function (reason) {
      let rooms = Object.keys(socket.rooms).filter((k) => k != socket.id);
      rooms.forEach(function (room) {
        io.sockets.in(room).clients((error, clients) => {
          if (error) throw error;
          if (clients.length === 0) {
            socketController.set_room_active(room, false);
            console.log(`All users have disconnected from room (${room}), deactivating.`);
          }
        });
        socket.to(room).emit("message_echo", messageType.userDisconnected, {
          ...user_details,
          ChatMessage: `${user_details.UserName} has left the room.`,
          TimeReceived: new Date().toJSON(),
        });
      });

      console.log(
        `(${user_details.UserId}) is closing the connection on socket (${socket.id}) with reason "${reason}".`
      );
    });
  });
};

module.exports = { messageType, init };
