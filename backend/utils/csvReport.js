const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");

const generateComplaintsCSV = async (complaints, outDir = "reports") => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filename = `complaints_report_${Date.now()}.csv`;
  const filePath = path.join(outDir, filename);

  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: "ticketId", title: "TicketID" },
      { id: "title", title: "Title" },
      { id: "dept", title: "Dept" },
      { id: "status", title: "Status" },
      { id: "location_city", title: "City" },
      { id: "priority", title: "Priority" },
      { id: "createdAt", title: "CreatedAt" },
      { id: "resolvedAt", title: "ResolvedAt" },
    ],
  });

  const records = complaints.map((c) => ({
    ticketId: c.ticketId,
    title: c.title,
    dept: c.dept,
    status: c.status,
    location_city: c.location_city,
    priority: c.priority,
    createdAt: c.createdAt,
    resolvedAt: c.resolvedAt || "",
  }));

  await csvWriter.writeRecords(records);
  return filePath;
};

module.exports = { generateComplaintsCSV };
