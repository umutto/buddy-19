class BaseRoom {
  Id = null;
  Name = null;
  Members = null;
  constructor(id, name, members = {}) {
    this.Id = id;
    this.Name = name;
    this.Members = members;
  }
}

module.exports = BaseRoom;
