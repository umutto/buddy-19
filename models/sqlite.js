const db = require("../configs/sqlite3").database;

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
                                               'Type', room.Type,
                                               'CreationDate', room.CreationDate,
                                               'MembershipDate', room_member.EnterDate,
                                               'UserName', room_member.UserName,
                                               'UserAvatar', room_member.UserAvatar,
                                               'UserRole', room_member.UserRole)) AS RoomMembership
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

const update_user_details = async (uuid, room, name, avatar) => {
  let query_user = `UPDATE user SET Name = COALESCE($name, Name), Avatar = COALESCE($avatar, Avatar) WHERE UUID = $uuid`;
  let query_member = `UPDATE room_member SET UserName = COALESCE($name, UserName), UserAvatar = COALESCE($avatar, UserAvatar)
                      WHERE UserId = $uuid AND RoomId = $room`;
  let params_user = { $uuid: uuid, $name: name, $avatar: avatar };
  let params_member = { $uuid: uuid, $room: room, $name: name, $avatar: avatar };
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(query_user, params_user, function (error) {
        if (error) reject(error);
      });
      db.run(query_member, params_member, function (error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  });
};

const create_new_room = async (
  roomUrl,
  roomType,
  roomName,
  roomPassword,
  roomSettings,
  roomTheme,
  hostUUID
) => {
  let query = `INSERT INTO room (PublicUrl, IsActive, Name, Password, Type, Settings, Theme, Host)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  let params = [
    roomUrl,
    0,
    roomName,
    roomPassword,
    roomType,
    roomSettings,
    roomTheme,
    hostUUID,
  ];
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(query, params, function (error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  });
};

const get_all_rooms = () => {
  let query = `SELECT PublicUrl FROM room`;
  let params = [];
  return new Promise((resolve, reject) => {
    db.all(query, params, function (error, rows) {
      if (error) reject(error);
      else resolve(rows);
    });
  });
};

const add_room_member = (uuid, room_id, name, avatar, role) => {
  let query_update = `UPDATE user SET Name = COALESCE(?, Name), Avatar = COALESCE(?, Avatar) WHERE UUID = ?`;
  let params_update = [name, avatar, uuid];
  let query_member = `INSERT INTO room_member (RoomId, UserId, UserName, UserAvatar, UserRole) VALUES(?, ?, ?, ?, ?)`;
  let params_member = [room_id, uuid, name, avatar, role];
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

const update_room_settings = async (room_url, name, password, theme) => {
  let query = `UPDATE room SET Name = COALESCE(?, Name), Password = COALESCE(?, Password), Theme = COALESCE(?, Theme) WHERE PublicUrl = ?`;
  let params = [name, password, theme, room_url];
  return new Promise((resolve, reject) => {
    db.run(query, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
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
  let query = `SELECT room.PublicUrl, room.IsActive, room.Name, room.Password,
                      room.Type, room.Settings, room.Theme, room.Host,
                      room.CreationDate, room.History
                FROM room WHERE PublicUrl = ?`;
  let params = [room_url];
  return new Promise((resolve, reject) => {
    db.get(query, params, function (error, row) {
      if (error) reject(error);
      else resolve(row);
    });
  });
};

const clean_rooms = async () => {
  let query = `DELETE FROM room WHERE CreationDate < date("now", "-7 day") AND IsActive = 0`;
  let params = [];
  return new Promise((resolve, reject) => {
    db.run(query, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  create_user,
  get_user_details,
  update_user_details,
  create_new_room,
  get_all_rooms,
  add_room_member,
  update_room_settings,
  set_room_active,
  get_room_details,
  clean_rooms,
};
