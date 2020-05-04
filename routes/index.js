var express = require("express");
var router = express.Router();

const nanoid = require("nanoid");

var sqliteController = require("../models/sqlite");

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
  let roomType = req.body.roomType || 1;
  let roomName = req.body.roomName || `A room with no name`;
  let roomPassword = req.body.roomPassword || null;
  let roundAmount = req.body.roundAmount || 3;
  let turnLimit = req.body.turnLimit || 60;
  let doublePoints = "doublePoints" in req.body && req.body.doublePoints === "on";
  let roomTheme = req.body.roomTheme || null;

  let roomUrl = nanoid.nanoid(6);
  let hostUUID = res.locals.UserAliasCookie;

  try {
    await sqliteController.create_new_room(
      roomUrl,
      roomType,
      roomName,
      roomPassword,
      roundAmount,
      turnLimit,
      doublePoints,
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
  if (!current_room) return res.redirect("/room/join/" + room_id);

  // Room is active and the user is a member
  res.locals.User.Name = current_room[0].UserName || req.UserClient.UserName;
  res.locals.User.Avatar = current_room[0].UserAvatar || req.UserClient.Avatar;

  room_details.Settings = JSON.parse(room_details.Settings);
  res.render("room.pug", {
    title: `Buddy-19: ${room_details.Name}`,
    RoomId: room_id,
    RoomTheme: room_details.Settings.roomTheme,
    Room: room_details,
  });
});

router.get("/room/join/:id", async function (req, res, next) {
  let room_id = req.params.id;
  try {
    room_details = await sqliteController.get_room_details(room_id);
    if (!room_details) return next({ status: 404, code: "Room Not Found" });

    console.log(req.body);
    res.render("join.pug", {
      title: `Buddy-19: ${room_details.Name}`,
      Room: room_details,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/room/join/:id", async function (req, res, next) {
  res.redirect("/room/" + room_id);
});

module.exports = router;
