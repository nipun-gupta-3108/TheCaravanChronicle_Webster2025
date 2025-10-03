const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  assignedToStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  assignedToAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  ticketId: { type: String, unique: true },
  title: String,
  description: String,
  dept: {
    type: String,
    enum: ["water", "roads", "sanitation", "electric"],
    required: true,
  },
  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"],
    default: "OPEN",
  },
  location_city: String,
  location_lat: Number,
  location_lng: Number,
  photoUrl: String,
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  resolvedAt: Date,
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
