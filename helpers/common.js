const fs = require("fs");

const get_file_list = async (dirname) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, { withFileTypes: true }, (error, filenames) => {
      if (error) reject(err);
      else resolve(filenames.filter((f) => f.isFile()).map((f) => f.name));
    });
  });
};

module.exports = { get_file_list };
