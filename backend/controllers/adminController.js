const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Staff = require("../models/Staff");
const Complaint = require("../models/Complaint");
const { sendNotification } = require("../utils/notifications");

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

const register = async (req, res) => {
  try {
    const { name, email, password, dept, location_city, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Admin.create({
      name,
      email,
      passwordHash,
      dept,
      location_city,
      phone,
    });

    res.json({
      message: "Admin registered",
      admin: { id: created._id, email: created.email },
    });
  } catch (err) {
    console.error("admin register", err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "admin", model: "Admin" },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("admin login", err);
    res.status(500).json({ error: "Server error" });
  }
};

const assignToStaff = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { complaintId, staffId } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint)
      return res.status(404).json({ error: "Complaint not found" });

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    complaint.assignedToStaffId = staff._id;
    complaint.assignedToAdminId = adminId;
    complaint.status = "IN_PROGRESS";
    complaint.updatedAt = new Date();
    await complaint.save();

    // increment staff taskCount
    staff.taskCount = (staff.taskCount || 0) + 1;
    await staff.save();

    // notify staff
    await sendNotification({
      to: staff.email,
      subject: `New Assignment: ${complaint.ticketId}`,
      message: `You have been assigned complaint ${complaint.ticketId} (${complaint.title}).`,
    });

    res.json({ message: "Assigned", complaint });
  } catch (err) {
    console.error("assignToStaff", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const filter = req.query || {};
    // Simple filtering support query params: status, dept, city
    const query = {};
    if (filter.status) query.status = filter.status;
  } catch (err) {
    console.error("getAllComplaints", err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { register, login, assignToStaff, getAllComplaints };
