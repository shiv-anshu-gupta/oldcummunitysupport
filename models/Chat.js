const mongoose = require("mongoose");

// Define the schema for chat messages
const chatSchema = new mongoose.Schema({
  sender: {
    type: String, // You can also use a User or NGO reference here
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the current date and time
  },
});

// Create the model
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
