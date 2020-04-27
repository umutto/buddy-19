var sqlite3 = require("sqlite3").verbose();
var nodeCleanup = require("node-cleanup");

const database = new sqlite3.Database(
  "./configs/db/buddy19.db",
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
