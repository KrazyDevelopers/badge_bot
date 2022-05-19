const { Schema, model } = require("mongoose");

let Badges = new Schema({
  id: String,
  name: String,
  emoji: String,
  createdAt: String
});

module.exports = model("badge", Badges);
