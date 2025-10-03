const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Citizen = require("../models/Citizen");
const Complaint = require("../models/Complaint");

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existing = await Citizen.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await Citizen.create({
      name,
      email,
      passwordHash,
      phone,
      address,
    });

    res.json({
      message: "Registered",
      user: { id: created._id, name: created.name, email: created.email },
    });
  } catch (error) {
    console.error("register error", err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Citizen.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "citizen", model: "Citizen" },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// citizen: create complaint (photo via multer)
const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      dept,
      location_city,
      location_lat,
      location_lng,
      priority,
      dueDate,
    } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const userId = req.user.id;

    // generate ticketId simple
    const ticketId = `TCKT-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const complaint = await Complaint.create({
      userId,
      ticketId,
      title,
      description,
      dept,
      location_city,
      location_lat,
      location_lng,
      photoUrl,
      priority: priority || "LOW",
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  } catch (err) {
    console.error("createComplaint", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = (await Complaint.find({ userId })).sort({ createdAt: -1 });
    res.json({ complaints: list });
  } catch (err) {
    console.error("getMyComplaints", err);
    res.status(500).json({ error: "Server error" });
  }
};
