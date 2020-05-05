var express = require("express");
var router = express.Router();

var formidable = require("formidable");

var sqliteController = require("../models/sqlite");

router.post("/update", async function (req, res, next) {
  let usr_id = req.UserClient.Id;
  var form = formidable({ multiples: true });

  try {
    form.parse(req, async (err, fields, files) => {
      await sqliteController.update_user_details(
        usr_id,
        fields.roomId,
        fields.userName,
        fields.userAvatar
      );

      req.UserClient = await sqliteController.get_user_details(usr_id);
      req.UserClient.RoomMembership = JSON.parse(req.UserClient.RoomMembership);

      res.status(200).send({
        status: 200,
        message: { User: req.UserClient },
      });
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong, try again later.",
      details: error,
    });
  }
});

module.exports = router;
