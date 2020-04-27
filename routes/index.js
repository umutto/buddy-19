var express = require("express");
var router = express.Router();

var sqliteController = require("../models/sqlite");

/* GET home page. */
router.get("/", function (req, res, next) {
  sqliteController._test();
  res.render("index", { title: "Buddy-19 Create a Room" });
});

router.post("/", async function (req, res, next) {
  let roomType = req.body.roomType || "Quiz";
  let roomName = req.body.roomName || `A Buddy-19 ${roomType} Room`;
  let roomPassword = req.body.roomPassword || null;
  let roundAmount = req.body.roundAmount || 3;
  let turnLimit = req.body.turnLimit || 60;
  let doublePoints = "doublePoints" in req.body && req.body.doublePoints === "on";
  let roomTemplate = req.body.roomTemplate || "bg-light";

  try {
    const room_id = await sqliteController.create_new_room(
      roomType,
      roomName,
      roomPassword,
      roundAmount,
      turnLimit,
      doublePoints,
      roomTemplate
    );
    res.redirect(`/room/${room_id}`);
  } catch (error) {
    next(error);
  }
});

router.get("/room/:id", function (req, res, next) {
  let room_id = req.params.id;
  res.render("room.pug", { title: `Buddy-19 Room ${room_id}` });
});

router.post("/room/:id", async function (req, res, next) {
  console.log(req.body);
  res.redirect("/");
});

module.exports = router;
