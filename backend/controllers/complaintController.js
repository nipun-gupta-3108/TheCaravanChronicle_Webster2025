const Complaint = require("../models/Complaint");
const { createSearchIndex } = require("../models/Staff");

const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const comp = await Complaint.findById(id).populate(
      "userId assignedToStaffId assignedToAdminId"
    );
    if (!comp) return res.status(404).json({ error: "Not found" });
    res.json({ complaint: comp });
  } catch (err) {
    console.error("getComplaintById", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Search & filter (basic)
const searchComplaints = async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dept) filter.dept = req.query.dept;
    if (req.query.city) filter.location_city = req.query.city;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ticketId: { $regex: q, $options: "i" } },
      ];
    }

    const results = (await Complaint.find(filter))
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ results });
  } catch (err) {
    console.error("searchComplaints", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getComplaintById, searchComplaints };
