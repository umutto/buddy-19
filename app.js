require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var locals = require("./middlewares/locals");
var usercookie = require("./middlewares/usercookie");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");

var CronJob = require("cron").CronJob;
var sqliteController = require("./models/sqlite");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// custom local vars and consistent alias cookie middleware
app.use(usercookie);
app.use(locals);

app.use("/", indexRouter);
app.use("/user", userRouter);

// custom cronjob to clean unactivated, old rooms at every 02:30
new CronJob(
  "00 30 02 * * *",
  function () {
    console.log("Cleaning unactivated rooms");
    sqliteController.clean_rooms();
  },
  null,
  true
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);

  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    RoomTheme: "bg-hypnotize",
    title: "Error :'(",
    status: err.status || 500,
    code: err.code || err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
