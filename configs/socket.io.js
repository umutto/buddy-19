var socket_io = require("socket.io");
var sqliteController = require("../models/sqlite");

var messageType = require("../lib/MessageType");
var YoutubeRoom = require("../lib/YoutubeRoom");
var QuizRoom = require("../lib/QuizRoom");
var SketchRoom = require("../lib/SketchRoom");
var CustomRoom = require("../lib/CustomRoom");

var room_sessions = {};

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
      EnterDate: new Date().toJSON(),
      SocketId: socket.id,
    };
    console.log(
      `(${user_details.Id}) has established a connection using socket (${socket.id}).`
    );

    socket.on("join", async function (room, ack = () => {}) {
      console.log(`(${user_details.Id}) is attempting to join room (${room})`);

      try {
        let room_details = await sqliteController.get_room_details(room);
        room_details.Settings = JSON.parse(room_details.Settings);

        if (!room_details) {
          ack({
            status: 404,
            message: `Room (${room}) is not found or not available anymore.`,
          });
        } else {
          socket.join(room);
          await update_user_details(user_details, room);

          // update server room sessions
          if (!Object.keys(room_sessions).includes(room)) {
            if (room_details.Type === 1)
              room_sessions[room] = new YoutubeRoom(room_details);
            else if (room_details.Type === 2)
              room_sessions[room] = new SketchRoom(room_details);
            else if (room_details.Type === 3)
              room_sessions[room] = new QuizRoom(room_details);
            else if (room_details.Type === 4)
              room_sessions[room] = new CustomRoom(room_details);
          }

          let { user_context, room_context } = room_sessions[room].onConnect(
            user_details
          );

          // announce user to room
          socket.to(room).emit("message_echo", messageType.userConnected, room_context);

          // send an echo to callback
          ack({
            status: 200,
            message: room,
            context: user_context,
          });

          room_sessions[room].addMember(user_details);
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
        let echo = room_sessions[room].onMessage(user_details, message_type, context);
        socket.to(room).emit("message_echo", message_type, echo);
        ack({ status: 200, message: echo });
      });

      socket.on("user-details", async function (context, ack = () => {}) {
        await update_user_details(user_details, room);

        // update server room sessions
        let { user_context, room_context } = room_sessions[room].updateMember(
          user_details.Id,
          user_details
        );

        socket.to(room).emit("message_echo", messageType.userDetails, room_context);
        ack({ status: 200, message: user_context });
      });

      socket.on("room-details", async function (context, ack = () => {}) {
        if (user_details.Id === room_sessions[room].Host) {
          // update server room sessions
          let { user_context, room_context } = room_sessions[room].editRoomDetails(
            user_details,
            context
          );

          socket.to(room).emit("message_echo", messageType.roomDetails, room_context);
          ack({ status: 200, message: user_context });
        } else
          ack({
            status: 403,
            message: "You are not allowed to change the settings.",
          });
      });
    });

    socket.on("disconnecting", function (reason) {
      let rooms = Object.keys(socket.rooms).filter((k) => k != socket.id);
      rooms.forEach(function (room) {
        // update server room sessions
        let context_echo = room_sessions[room].removeMember(user_details.Id, reason);

        socket.to(room).emit("message_echo", messageType.userDisconnected, context_echo);

        let n = room_sessions[room].getMemberCount;
        if (n === 0) delete room_sessions[room];

        // deactivate room in db
        //     socketController.set_room_active(room, false);
        //     console.log(`All users have disconnected from room (${room}), deactivating.`);
      });

      console.log(
        `(${user_details.Id}) is closing the connection on socket (${socket.id}) with reason "${reason}".`
      );
    });
  });
};

module.exports = { messageType, init };
