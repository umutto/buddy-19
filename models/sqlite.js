const db = require("../configs/sqlite3").database;

// const all = (query, params = []) => {
//   return new Promise(function (resolve, reject) {
//     database.all(query, params, function (error, rows) {
//       if (error) reject(error);
//       else resolve({ rows: rows });
//     });
//   });
// };

const create_user = (uuid) => {
  let query = `INSERT INTO user (UUID)
                VALUES (?)
               ON CONFLICT(UUID) DO UPDATE SET LastSeenDate=CURRENT_TIMESTAMP`;
  let params = [uuid];
  return new Promise(function (resolve, reject) {
    db.run(query, params, function (error, rows) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const create_new_room = async (
  roomUrl,
  roomType,
  roomName,
  roomPassword,
  roundAmount,
  turnLimit,
  doublePoints,
  roomTemplate,
  hostUUID
) => {
  let query = `INSERT INTO room (PublicUrl, IsActive, Name, Password, RoomType, Settings, Host)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  let roomSettings = JSON.stringify({
    roundAmount,
    turnLimit,
    doublePoints,
    roomTemplate,
  });
  let params = [roomUrl, 1, roomName, roomPassword, roomType, roomSettings, hostUUID];
  return new Promise(function (resolve, reject) {
    db.serialize(() => {
      db.run(query, params, function (error, rows) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  });
};

module.exports = { create_user, create_new_room };
