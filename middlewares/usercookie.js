const nanoid = require("nanoid");
var sqliteController = require("../models/sqlite");

module.exports = async (req, res, next) => {
  var user_alias = req.cookies.user_alias;
  if (user_alias === undefined) {
    var user_alias = nanoid.nanoid();
    var cookie_opts = {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
    };
    if (req.app.get("env") === "production") cookie_opts.secure = "true";
    res.cookie("user_alias", user_alias, cookie_opts);
    console.log(
      `A new user with alias ${user_alias} have visited ${
        req.protocol + "://" + req.get("host") + req.originalUrl
      }.`
    );
    req.UserClient = {
      UUID: res.locals.UserAliasCookie,
      CreationDate: null,
      LastSeenDate: null,
      Avatar: null,
      RoomMembership: [],
    };
  } else {
    req.UserClient = await sqliteController.get_user_details(user_alias);
    req.UserClient.RoomMembership = JSON.parse(req.UserClient.RoomMembership);
  }
  await sqliteController.create_user(user_alias);
  res.locals.UserAliasCookie = user_alias;
  next();
};
