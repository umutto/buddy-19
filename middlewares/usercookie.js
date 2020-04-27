const { v4: uuidv4 } = require("uuid");

module.exports = function (req, res, next) {
  var cookie = req.cookies.user_alias;
  if (cookie === undefined) {
    var usr_id = uuidv4();
    var cookie_opts = {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
    };
    if (req.app.get("env") === "production") cookie_opts.secure = "true";
    res.cookie("user_alias", usr_id, cookie_opts);
    res.locals.UserAliasCookie = usr_id;
    console.log(`A new user with ${usr_id}.`);
  } else {
    res.locals.UserAliasCookie = cookie;
    console.log(`User with ${cookie} has returned.`);
  }
  next();
};
