const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, // No password hashing
  },
});

module.exports = mongoose.model("Ngo", ngoSchema);
