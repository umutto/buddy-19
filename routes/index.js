var express = require("express");
var router = express.Router();

const nanoid = require("nanoid");
var formidable = require("formidable");

var sqliteController = require("../models/sqlite");
var get_file_list = require("../helpers/common").get_file_list;

router.get("/", async function (req, res, next) {
  res.render("index", {
    title: "Buddy-19!",
    RoomTheme: "bg-webb",
  });
});
router.get("/create", async function (req, res, next) {
  res.render("create", { title: "Buddy-19 Create a Room", RoomTheme: "bg-webb" });
});

router.post("/create", async function (req, res, next) {
  let roomType = req.body.roomType ? parseInt(req.body.roomType) : 1;
  let roomName = req.body.roomName || `A room with no name`;
  let roomPassword = req.body.roomPassword || null;

  let roomTheme = req.body.roomTheme || null;

  let roomUrl = null;
  let hostUUID = res.locals.UserAliasCookie;

  try {
    let current_rooms = await sqliteController.get_all_rooms();
    current_rooms = current_rooms.map((r) => r.PublicUrl);
    do {
      roomUrl = nanoid.nanoid(6);
    } while (current_rooms.includes(roomUrl));

    let roomSettings = {};
    if (roomType === 1)
      // Youtube type room
      roomSettings = {
        ...roomSettings,
        ...{
          syncMode: req.body.syncMode,
          interactiveControls: req.body.interactiveControls,
          fullScreen: "fullScreen" in req.body && req.body.fullScreen === "on",
        },
      };
    else if (roomType === 2)
      // Sketch type room
      roomSettings = {
        ...roomSettings,
        ...{
          wordDic: req.body.wordDic || 1,
          roundAmount: req.body.roundAmount || 3,
          turnLimit: req.body.turnLimit || 60,
          turnEnd: req.body.turnEnd || 0,
          doublePoints: "doublePoints" in req.body && req.body.doublePoints === "on",
          customDict: req.body.customDict || null,
          customFreq: req.body.customDict ? req.body.customFreq || 50 : 0,
        },
      };
    else if (roomType === 3)
      // Quiz type room
      roomSettings = {
        ...roomSettings,
        ...{
          roundAmount: req.body.roundAmount || 3,
          turnLimit: req.body.turnLimit || 60,
          turnEnd: req.body.turnEnd || 0,
          doublePoints: "doublePoints" in req.body && req.body.doublePoints === "on",
        },
      };

    await sqliteController.create_new_room(
      roomUrl,
      roomType,
      roomName,
      roomPassword,
      JSON.stringify(roomSettings),
      roomTheme,
      hostUUID
    );
    res.redirect(`/room/${roomUrl}`);
  } catch (error) {
    next(error);
  }
});

router.get("/room/:id", async function (req, res, next) {
  let room_id = req.params.id;
  let room_details = null;

  // Check if room exists & active
  try {
    room_details = await sqliteController.get_room_details(room_id);
    if (!room_details) return next({ status: 404, code: "Room Not Found" });
  } catch (error) {
    return next(error);
  }

  // Check if user is a member of room, if not redirect to join page
  let current_room = req.UserClient.RoomMembership.filter((m) => m.Url === req.params.id);
  if (!current_room || current_room.length == 0) return res.redirect("/join/" + room_id);

  // Room is active and the user is a member

  res.locals.User.Name =
    current_room[0].UserName ||
    req.UserClient.UserName ||
    "User-" + (Math.random() + 1).toString(36).substr(2, 5);
  let avatars = await get_file_list("./public/images/user_icons");
  let usr_avatar = current_room[0].UserAvatar || req.UserClient.Avatar;
  res.locals.User.Avatar = avatars.includes(usr_avatar) ? usr_avatar : null;

  room_details.Settings = JSON.parse(room_details.Settings);
  res.render("room.pug", {
    title: `Buddy-19: ${room_details.Name}`,
    RoomId: room_id,
    RoomTheme: room_details.Theme,
    Room: room_details,
  });
});

router.get("/join/:id", async function (req, res, next) {
  let room_id = req.params.id;

  // user is already a member
  let current_room = req.UserClient.RoomMembership.filter((m) => m.Url === room_id);
  if (current_room && current_room.length > 0) return res.redirect("/room/" + room_id);

  try {
    room_details = await sqliteController.get_room_details(room_id);
    if (!room_details) return next({ status: 404, code: "Room Not Found" });
    if (!room_details.IsActive && room_details.Host !== req.UserClient.Id)
      return next({
        status: 401,
        code: "Room is not active, waiting for host.",
      });

    res.render("join.pug", {
      RoomId: room_id,
      title: `Buddy-19: ${room_details.Name}`,
      Room: room_details,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/join/:id", async function (req, res, next) {
  let room_id = req.params.id;
  var form = formidable({ multiples: true });

  try {
    form.parse(req, async (err, fields, files) => {
      room_details = await sqliteController.get_room_details(room_id);
      if (
        !room_details.Password ||
        room_details.Host === req.UserClient.Id ||
        room_details.Password === fields.roomPassword
      ) {
        await sqliteController.add_room_member(
          req.UserClient.Id,
          room_id,
          fields.userName,
          fields.userAvatar
        );
        if (room_details.Host === req.UserClient.Id)
          await sqliteController.set_room_active(room_id, true);
        return res.status(200).send({
          status: 200,
          message: room_details,
        });
      } else {
        return res.status(401).send({
          status: 401,
          message: "Wrong password!",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: 500,
      message: "Something went wrong, try again later.",
      details: error,
    });
  }
});

module.exports = router;
