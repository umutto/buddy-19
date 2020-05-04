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
  return new Promise((resolve, reject) => {
    db.run(query, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get_user_details = (uuid) => {
  let query = `SELECT user.UUID AS Id, user.CreationDate, user.LastSeenDate, user.Name, user.Avatar,
                  json_group_array(json_object('Url', room.PublicUrl,
                                               'IsActive', room.IsActive,
                                               'Name', room.Name,
                                               'Type', room.RoomType,
                                               'CreationDate', room.CreationDate,
                                               'MembershipDate', room_member.EnterDate,
                                               'UserName', room_member.UserName,
                                               'UserAvatar', room_member.UserAvatar)) AS RoomMembership
                FROM user
                  LEFT JOIN room_member
                    ON user.UUID = room_member.UserId
                  LEFT JOIN room
                    ON room_member.RoomId = room.PublicUrl
                GROUP BY user.UUID
                HAVING user.UUID = ?`;
  let params = [uuid];
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(query, params, function (error, row) {
        if (error) reject(error);
        else resolve(row);
      });
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
  roomTheme,
  hostUUID
) => {
  let query = `INSERT INTO room (PublicUrl, IsActive, Name, Password, RoomType, Settings, Host)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  let roomSettings = JSON.stringify({
    roundAmount,
    turnLimit,
    doublePoints,
    roomTheme,
  });
  let params = [roomUrl, 1, roomName, roomPassword, roomType, roomSettings, hostUUID];
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(query, params, function (error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  });
};

const add_room_member = (uuid, room_id, name, avatar) => {
  let query_update = `UPDATE user SET Name = COALESCE(?, Name), Avatar = COALESCE(?, Avatar) WHERE UUID = ?`;
  let params_update = [name, avatar, uuid];
  let query_member = `INSERT INTO room_member (RoomId, UserId, UserName, UserAvatar) VALUES(?, ?, ?, ?)`;
  let params_member = [room_id, uuid, name, avatar];
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(query_update, params_update, function (error) {
        if (error) reject(error);
      });
      db.run(query_member, params_member, function (error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  });
};

const set_room_active = async (room_url, state) => {
  let query = `UPDATE room SET IsActive = ? WHERE PublicUrl = ? AND IsActive = ?`;
  let params = [+state, room_url, +!state];
  return new Promise((resolve, reject) => {
    db.run(query, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get_room_details = async (room_url) => {
  let query = `SELECT * FROM room WHERE PublicUrl = ? AND IsActive = 1`;
  let params = [room_url];
  return new Promise((resolve, reject) => {
    db.get(query, params, function (error, row) {
      if (error) reject(error);
      else resolve(row);
    });
  });
};

module.exports = {
  create_user,
  get_user_details,
  create_new_room,
  add_room_member,
  set_room_active,
  get_room_details,
};
