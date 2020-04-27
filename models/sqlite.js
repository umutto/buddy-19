const sqlite3 = require("../configs/sqlite3");

// const all = (query, params = []) => {
//   return new Promise(function (resolve, reject) {
//     database.all(query, params, function (error, rows) {
//       if (error) reject(error);
//       else resolve({ rows: rows });
//     });
//   });
// };

// const run = (query, params=[]) => {
//   return new Promise(function (resolve, reject) {
//     database.all(query, params, function (error, rows) {
//       if (error) reject(error);
//       else resolve({ rows: rows });
//     });
//   });
// }
const create_a_user = () => {
  let query = ``;
  let params = [usr_id];
  return new Promise(function (resolve, reject) {
    database.run(query, params, function (error, rows) {
      if (error) reject(error);
      else resolve({ rows: rows });
    });
  });
};
const create_new_room = async (
  roomType,
  roomName,
  roomPassword,
  roundAmount,
  turnLimit,
  doublePoints,
  roomTemplate
) => {};

const _test = async () => {
  console.log(sqlite3.database);
};

module.exports = { _test, create_new_room };
