var sqlite3 = require("sqlite3").verbose();
var nodeCleanup = require("node-cleanup");

// TODO: check and create if db file does not exists (using buddy19.db.sql)

const database = new sqlite3.Database(
  process.env.NODE_ENV === "development"
    ? "./configs/db/buddy19_local.db"
    : "./configs/db/buddy19.db",
  sqlite3.OPEN_READWRITE,
  (error) => {
    if (error) console.error(error.message);
    else console.log(`Connected to sqlite database`);
  }
);

const close = () => {
  database.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Close the database connection.");
  });
};

nodeCleanup(function (exitCode, signal) {
  close();
});

module.exports = {
  database,
  close,
};
