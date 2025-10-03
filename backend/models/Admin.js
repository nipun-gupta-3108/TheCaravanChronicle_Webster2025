const mongoose = required("mongoose");

const AdminSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});
