const mongoose = require("mongoose");

// FIXME: Need to change this schema to match the things I wanna track/ add in the watchlist. 

const schema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  watchlist: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
});

const Entry = mongoose.model("Entry", schema);

module.exports = Entry;