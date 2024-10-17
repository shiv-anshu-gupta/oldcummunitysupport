const mongoose = require("mongoose");

const medicalSupportSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: {
    type: String,
    enum: [
      "Medicine",
      "Doctor Consultation",
      "Nursing Support",
      "Medical Aid",
      "Equipment",
      "Health Checkup",
    ],
    required: true,
  },
  ngoName: {
    // Add this field
    type: String,
    required: true, // Or false, depending on your requirements
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MedicalSupport = mongoose.model("MedicalSupport", medicalSupportSchema);

module.exports = MedicalSupport;
