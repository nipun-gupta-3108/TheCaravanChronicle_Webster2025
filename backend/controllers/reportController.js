const Report = require("../models/Report");
const Complaint = require("../models/Complaint");
const { generateComplaintsCSV } = require("../utils/csvReport");

const generateReport = async (req, res) => {
  try {
    // allow optional filters
    const filter = {};
    if (req.query.dept) filter.dept = req.query.dept;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter.location_city = req.query.city;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    const csvPath = await generateComplaintsCSV(complaints, "backend/reports");

    const report = await Report.create({
      generatedBy: req.user.id,
      generatedByModel: req.user.role === "admin" ? "Admin" : "Staff",
      reportType: "complaints_csv",
      resolvedComplaints: complaints.filter((c) => c.status === "RESOLVED")
        .length,
      pendingComplaints: complaints.filter((c) => c.status !== "RESOLVED")
        .length,
      overdueComplaints: complaints.filter((c) => c.status === "ESCALATED")
        .length,
      reportCsvPath: csvPath,
    });

    res.json({ message: "Report generated", report, csvPath });
  } catch (err) {
    console.error("generateReport", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { generateReport };
