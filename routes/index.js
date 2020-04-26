var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Buddy-19 Create a Room" });
});

router.get("/room/:id", function (req, res, next) {
  let room_id = req.params.id;
  res.render("room.pug", { title: `Buddy-19 Room ${room_id}` });
});

module.exports = router;
