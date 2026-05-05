// ============================================================
// Wings Forward — Backend Server
// Fetches real-time airline jobs from Indeed via RapidAPI
// ============================================================

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.static("public"));

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Map of Spirit role → search keywords for Indeed
const ROLE_QUERIES = {
  "flight-attendant": "flight attendant",
  "pilot":            "airline pilot first officer captain",
  "ramp-agent":       "ramp agent ground operations airline",
  "mechanic":         "aircraft mechanic A&P airline",
  "customer-service": "airport customer service agent airline",
  "gate-agent":       "gate agent airline airport",
  "cargo":            "cargo handler airline airport",
  "corporate":        "airline operations analyst corporate aviation",
};

// Airlines we care about (used to filter/label results)
const TARGET_AIRLINES = [
  "American Airlines","Delta Air Lines","United Airlines",
  "Southwest Airlines","JetBlue","Alaska Airlines",
  "Frontier Airlines","Allegiant","Avelo","Spirit",
  "Sun Country","Hawaiian Airlines","Breeze Airways",
  "Contour Airlines","SkyWest","Envoy Air","Republic Airways",
  "PSA Airlines","Piedmont Airlines"
];

// ── GET /api/jobs ──────────────────────────────────────────
// Query params: role (string), location (optional)
app.get("/api/jobs", async (req, res) => {
  const role     = req.query.role || "flight-attendant";
  const location = req.query.location || "United States";
  const query    = ROLE_QUERIES[role] || role;

  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: "RAPIDAPI_KEY not set in .env file" });
  }

  try {
    const url = `https://jsearch.p.rapidapi.com/search?` +
      `query=${encodeURIComponent(query + " airline")}&` +
      `location=${encodeURIComponent(location)}&` +
      `num_pages=3&` +
      `date_posted=month`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key":  RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    const data = await response.json();

    if (!data.data) {
      return res.status(502).json({ error: "No data from jobs API", raw: data });
    }

    // Shape the data for the frontend
    const jobs = data.data.map((job) => ({
      id:          job.job_id,
      title:       job.job_title,
      employer:    job.employer_name,
      location:    `${job.job_city || ""}${job.job_state ? ", " + job.job_state : ""}`,
      type:        job.job_employment_type || "Full-time",
      salary:      formatSalary(job),
      posted:      formatDate(job.job_posted_at_datetime_utc),
      applyUrl:    job.job_apply_link,
      description: (job.job_description || "").slice(0, 300) + "...",
      isAirline:   TARGET_AIRLINES.some(a =>
        job.employer_name?.toLowerCase().includes(a.toLowerCase())
      ),
      logo:        job.employer_logo || null,
    }));

    // Prioritize known airlines first
    jobs.sort((a, b) => (b.isAirline ? 1 : 0) - (a.isAirline ? 1 : 0));

    res.json({ jobs, total: jobs.length, role, query });

  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/airlines ─────────────────────────────────────
// Returns list of airlines known to be hiring with direct career links
app.get("/api/airlines", (req, res) => {
  res.json(AIRLINE_DIRECTORY);
});

// ── Helpers ───────────────────────────────────────────────
function formatSalary(job) {
  if (job.job_min_salary && job.job_max_salary) {
    const fmt = (n) => n >= 1000
      ? `$${Math.round(n / 1000)}K`
      : `$${Math.round(n)}/hr`;
    return `${fmt(job.job_min_salary)}–${fmt(job.job_max_salary)}`;
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return "Recently posted";
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)} weeks ago`;
  return "1+ month ago";
}

// ── Static airline directory ───────────────────────────────
const AIRLINE_DIRECTORY = [
  { name:"American Airlines",  url:"https://jobs.aa.com/search-jobs",              color:"#E31837", emoji:"🦅" },
  { name:"Delta Air Lines",    url:"delta.avature.net/en_US/careers",                    color:"#003B7B", emoji:"🔵" },
  { name:"United Airlines",    url:"https://careers.united.com/",                   color:"#0056A2", emoji:"🌐" },
  { name:"Southwest Airlines", url:"https://careers.southwestair.com/us/en/",        color:"#304CB2", emoji:"❤️"  },
  { name:"JetBlue",            url:"https://careers.jetblue.com",                  color:"#00B2A9", emoji:"🩵" },
  { name:"Alaska Airlines",    url:"https://careers.alaskaair.com/",                   color:"#00537B", emoji:"🐺" },
  { name:"Frontier Airlines",  url:"https://www.flyfrontier.com/Careers",                 color:"#008000", emoji:"🌿" },
  { name:"Allegiant Air",      url:"https://www.allegiantair.jobs/",                color:"#FF6600", emoji:"🟠" },
  { name:"Avelo Airlines",     url:"https://www.aveloair.com/careers",             color:"#5B0083", emoji:"🟣" },
  { name:"Sun Country",        url:"https://www.suncountry.com/about/careers",     color:"#FFD700", emoji:"☀️"  },
  { name:"Hawaiian Airlines",  url:"https://careers.alaskaair.com/hawaiian-airlines/",         color:"#6B1FAB", emoji:"🌺" },
  { name:"Breeze Airways",     url:"https://jobs.flybreeze.com/",            color:"#00A6D6", emoji:"🫧" },
  { name:"SkyWest Airlines",   url:"https://www.skywest.com/skywest-airline-jobs/",color:"#003366", emoji:"⭐" },
  { name:"Republic Airways",   url:"https://rjet.com/careers/",      color:"#CC0000", emoji:"🔴" },
  { name:"Envoy Air",          url:"https://www.envoyair.com/careers/",                 color:"#E31837", emoji:"✈️"  },
  { name:"PSA Airlines",       url:"https://psaairlines.com/more-airline-careers/",          color:"#004990", emoji:"🔷" },
  { name:"Piedmont Airlines",  url:"https://www.piedmont-airlines.com/careers",    color:"#003087", emoji:"🦋" },
  { name:"GoJet Airlines",     url:"https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=a7828c0b-d30d-40a2-a3ee-61c80628985c&ccId=19000101_000001&lang=en_US",        color:"#1A3F6F", emoji:"🚀" },
];

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✈️  Wings Forward server running at http://localhost:${PORT}`);
  console.log(`   Open your browser and go to: http://localhost:${PORT}\n`);
});
