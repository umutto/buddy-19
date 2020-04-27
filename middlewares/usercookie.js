const { v4: uuidv4 } = require("uuid");

module.exports = function (req, res, next) {
  var cookie = req.cookies.user_alias;
  if (cookie === undefined) {
    var usr_id = uuidv4();
    res.cookie("user_alias", usr_id, {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
      secure: "true",
    });
    console.log(`A new user with ${usr_id}.`);
  } else {
    console.log(`User with ${cookie} has returned.`);
  }
  next();
};
