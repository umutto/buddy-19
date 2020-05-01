var express = require("express");
var router = express.Router();

const shortid = require("shortid");

var sqliteController = require("../models/sqlite");

/* GET home page. */
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
  let roomName = req.body.roomName || `A Buddy-19 ${roomType} Room`;
  let roomPassword = req.body.roomPassword || null;
  let roundAmount = req.body.roundAmount || 3;
  let turnLimit = req.body.turnLimit || 60;
  let doublePoints = "doublePoints" in req.body && req.body.doublePoints === "on";
  let roomTheme = req.body.roomTheme || null;

  let roomUrl = shortid.generate();
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
  try {
    let room_details = await sqliteController.get_room_details(room_id);
    if (!room_details) return next({ status: 404, code: "Room Not Found" });

    room_details.Settings = JSON.parse(room_details.Settings);
    res.render("room.pug", {
      title: `Buddy-19 Room ${room_id}`,
      RoomId: room_id,
      RoomTheme: room_details.Settings.roomTheme,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/room/:id", async function (req, res, next) {
  console.log(req.body);
  res.redirect("/");
});

module.exports = router;
