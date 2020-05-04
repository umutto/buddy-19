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

    // TODO:
    // get user details from db

    // when user changes details, set them in db by an ajax call on client side and send a user_edit message here
    // when that message is received, update these user_details object from database
    let user_details = {
      Id: conn_client.UserId,
      Name: conn_client.UserName || "Guest-" + Math.floor(Math.random() * 10000),
      Avatar: conn_client.UserAvatar || "",
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
        } else if (
          user_details.Id !== room_details.Host &&
          room_details.password &&
          room_details.password !== conn_client.password
        ) {
          ack({ status: 401, message: "Wrong password." });
        } else {
          socket.join(room);
          await sqliteController.get_user_details(user_details.Id).then(function (rows) {
            let current_room =
              rows.RoomMembership && rows.RoomMembership.length > 0
                ? JSON.parse(rows.RoomMembership).filter((r) => r.Url === room)
                : {};
            user_details.Name = current_room.UserName || rows.Name;
            user_details.Avatar = current_room.UserAvatar || rows.Avatar;
          });

          ack({ status: 200, message: room });
          socket.to(room).emit("message_echo", messageType.userConnected, {
            User: user_details,
            ChatMessage: `${user_details.Name} has joined the room!`,
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
          User: user_details,
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
