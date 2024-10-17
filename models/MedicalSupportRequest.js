const mongoose = require("mongoose");

const UserSelectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userName: { type: String, required: true }, // Added userName field
  medicalSupportId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const UserSelection = mongoose.model("UserSelection", UserSelectionSchema);

module.exports = UserSelection;
