var sqlite3 = require("sqlite3").verbose();

async function openDB(db_file) {
  return await new Promise((resolve, reject) => {
    var db = new sqlite3.Database(db_file, (error) => {
      if (error) reject(error);
      else resolve(db);
    });
  });
}

module.exports = {
  database: null,
  init: async (db_file) => {
    if (!this.database) {
      try {
        this.database = await openDB(db_file);
        console.log(`Connected to ${db_file}`);
      } catch (error) {
        console.error(error.message);
        return null;
      }
    }

    return this.database;
  },
  all: (query, params = [], serialize = true) => {
    return new Promise(function (resolve, reject) {
      if (serialize)
        this.database.serialize(function () {
          this.database.all(query, params, function (error, rows) {
            console.log(rows);
            if (error) reject(error);
            else resolve({ rows: rows });
          });
        });
      else
        this.database.all(query, params, function (error, rows) {
          console.log(rows);
          if (error) reject(error);
          else resolve({ rows: rows });
        });
    });
  },
  close: () => {
    this.database.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Close the database connection.");
    });
  },
};
