const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const Complaint = require("../models/Complaint");

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

const register = async (req, res) => {
  try {
    const { name, email, password, dept, location_city, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await Staff.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Staff.create({
      name,
      email,
      passwordHash,
      dept,
      location_city,
      phone,
    });

    res.json({
      message: "Staff registered",
      staff: { id: created._id, email: created.email },
    });
  } catch (err) {
    console.error("staff register", err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Staff.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "staff", model: "Staff" },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("staff login", err);
    res.status(500).json({ error: "Server error" });
  }
};

// staff: view assigned complaints & change status
const getAssigned = async (req, res) => {
  try {
    const staffId = req.user.id;
    const complaints = (
      await Complaint.find({ assignedToStaffId: staffId })
    ).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    console.error("getAssigned", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint)
      return res.status(404).json({ error: "Complaint not found" });
    if (String(complaint.assignedToStaffId) !== String(staffId))
      return res.status(403).json({ error: "Not your assignment" });

    if (status) complaint.status = status;
    complaint.updatedAt = new Date();
    if (status === "RESOLVED") complaint.resolvedAt = new Date();
    await complaint.save();

    res.json({ message: "Updated", complaint });
  } catch (err) {
    console.error("updateStatus", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, login, getAssigned, updateStatus };
