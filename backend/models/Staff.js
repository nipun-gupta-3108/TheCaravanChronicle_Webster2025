const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dept: {
    type: String,
    enum: ["water", "roads", "sanitation", "electric"],
    default: "roads",
  },
  location_city: String,
  phone: String,
  taskCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model("Staff", StaffSchema);
