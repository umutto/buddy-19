const { v4: uuidv4 } = require("uuid");
var sqliteController = require("../models/sqlite");

module.exports = function (req, res, next) {
  var user_alias = req.cookies.user_alias;
  if (user_alias === undefined) {
    var user_alias = uuidv4();
    var cookie_opts = {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
    };
    if (req.app.get("env") === "production") cookie_opts.secure = "true";
    res.cookie("user_alias", user_alias, cookie_opts);
    console.log(`A new user with ${user_alias}.`);
  } else {
    console.log(`User with ${user_alias} has returned.`);
  }
  sqliteController.create_user(user_alias);
  res.locals.UserAliasCookie = user_alias;
  next();
};