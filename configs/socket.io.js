var socket_io = require("socket.io");
var sqliteController = require("../models/sqlite");

var sanitizeHtml = require("sanitize-html");

const messageType = {
  userConnected: 0,
  userDisconnected: 1,
  userChatMessage: 2,
  userChatReaction: 3,
  userDetails: 4,
};

const update_user_details = async (user_details, room) => {
  let result = await sqliteController.get_user_details(user_details.Id);
  let current_room =
    result.RoomMembership && result.RoomMembership.length > 0
      ? JSON.parse(result.RoomMembership).filter((r) => r.Url === room)
      : {};
  user_details.Name = current_room.UserName || result.Name;
  user_details.Avatar = current_room.UserAvatar || result.Avatar;
};

const init = (server) => {
  const io = socket_io(server, {
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  io.on("connection", function (socket) {
    let conn_client = socket.request._query;

    let user_details = {
      Id: conn_client.UserId,
      Name: conn_client.UserName || "Guest-" + Math.floor(Math.random() * 10000),
      Avatar: conn_client.UserAvatar || "",
      SocketId: socket.id,
    };
    console.log(
      `(${user_details.Id}) has established a connection using socket (${socket.id}).`
    );

    let room_details = null;

    socket.on("join", async function (room, ack = () => {}) {
      console.log(`(${user_details.Id}) is attempting to join room (${room})`);

      try {
        room_details = await sqliteController.get_room_details(room);
        room_details.Settings = JSON.parse(room_details.Settings);
        if (!room_details) {
          ack({
            status: 404,
            message: `Room (${room}) is not found or not available anymore.`,
          });
        } else {
          socket.join(room);
          await update_user_details(user_details, room);

          ack({
            status: 200,
            message: room,
            context: {
              User: user_details,
              ChatMessage: `You have joined the ${room_details.Name} room!`,
              TimeReceived: new Date().toJSON(),
            },
          });
          socket.to(room).emit("message_echo", messageType.userConnected, {
            User: user_details,
            ChatMessage: `${user_details.Name} has joined the room!`,
            TimeReceived: new Date().toJSON(),
          });
        }
      } catch (error) {
        console.log(error);
        ack({
          status: 500,
          message: "Something went wrong, try again later.",
          details: error,
        });
      }

      socket.on("message", function (message_type, context, ack = () => {}) {
        if (context.ChatMessage) context.ChatMessage = sanitizeHtml(context.ChatMessage);

        let context_echo = {
          User: user_details,
          ...context,
          TimeReceived: new Date().toJSON(),
        };
        socket.to(room).emit("message_echo", message_type, context_echo);
        ack({ status: 200, message: context_echo });
      });

      socket.on("user-details", async function (context, ack = () => {}) {
        await update_user_details(user_details, room);
        let context_echo = {
          User: user_details,
          ...context,
          TimeReceived: new Date().toJSON(),
        };
        socket.to(room).emit("message_echo", messageType.userDetails, context_echo);
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
          User: user_details,
          ChatMessage: `${user_details.Name} has left the room.`,
          TimeReceived: new Date().toJSON(),
          Reason: reason,
        });
      });

      console.log(
        `(${user_details.Id}) is closing the connection on socket (${socket.id}) with reason "${reason}".`
      );
    });
  });
};

module.exports = { messageType, init };
