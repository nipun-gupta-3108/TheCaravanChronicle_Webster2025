const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Staff = require("../models/Staff");
const Citizen = require("../models/Citizen");

const jwtSecret = process.env.JWT_SECRET || "secret";

// authentication
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    // payload: { id, role, model }
    req.user = payload;
    // attach full user object if needed
    if (payload.role === "admin")
      req.userDoc = await Admin.findById(payload.id).lean();
    else if (payload.role === "staff")
      req.userDoc = await Staff.findById(payload.id).lean();
    else if (payload.role === "citizen")
      req.userDoc = await Citizen.findById(payload.id).lean();
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// authorization (role check)
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: "Forbidden" });
  next();
};

module.exports = { authMiddleware, requireRole };
