// ============================================================
// Wings Forward — Backend Server
// Powered by Jooble — pulls from Indeed, LinkedIn, Glassdoor,
// ZipRecruiter, Monster and 1000+ job sites simultaneously
// ============================================================

const express = require(“express”);
const cors = require(“cors”);
const fetch = require(“node-fetch”);
require(“dotenv”).config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(“public”));

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

// Map Spirit roles to search keywords
const ROLE_QUERIES = {
“flight-attendant”: “flight attendant airline”,
“pilot”:            “airline pilot first officer captain”,
“ramp-agent”:       “ramp agent ground operations airline”,
“mechanic”:         “aircraft mechanic A&P aviation”,
“customer-service”: “airport customer service agent airline”,
“gate-agent”:       “gate agent airline airport”,
“cargo”:            “cargo handler airline airport”,
“corporate”:        “airline operations coordinator aviation corporate”,
};

// ── GET /api/jobs ──────────────────────────────────────────
app.get(”/api/jobs”, async (req, res) => {
const role     = req.query.role || “flight-attendant”;
const location = req.query.location || “United States”;
const keywords = ROLE_QUERIES[role] || role;

if (!JOOBLE_API_KEY) {
return res.status(500).json({ error: “JOOBLE_API_KEY not set in environment variables” });
}

try {
const response = await fetch(https://jooble.org/api/${JOOBLE_API_KEY}, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
keywords:     keywords,
location:     location,
page:         “1”,
ResultOnPage: 20
})
});


const data = await response.json();

if (!data.jobs) {
  return res.status(502).json({ error: "No jobs returned from Jooble", raw: data });
}

// Known airlines for matching
const AIRLINES = [
  "american airlines","delta air lines","united airlines",
  "southwest airlines","jetblue","alaska airlines",
  "frontier airlines","allegiant","avelo","spirit",
  "sun country","hawaiian airlines","breeze airways",
  "skywest","envoy air","republic airways","psa airlines",
  "piedmont airlines","gojet","contour airlines"
];

const jobs = data.jobs.map((job) => ({
  id:          job.id,
  title:       job.title,
  employer:    job.company || "Aviation Employer",
  location:    job.location || location,
  type:        job.type || "Full-time",
  salary:      job.salary || null,
  posted:      formatDate(job.updated),
  applyUrl:    job.link,
  description: (job.snippet || "").slice(0, 300) + "...",
  isAirline:   AIRLINES.some(a =>
    (job.company || "").toLowerCase().includes(a)
  ),
  logo: null,
}));

jobs.sort((a, b) => (b.isAirline ? 1 : 0) - (a.isAirline ? 1 : 0));

res.json({ jobs, total: jobs.length, role, keywords });


} catch (err) {
console.error(“Jooble API Error:”, err);
res.status(500).json({ error: err.message });
}
});

// ── GET /api/airlines ─────────────────────────────────────
app.get(”/api/airlines”, (req, res) => {
res.json(AIRLINE_DIRECTORY);
});

// ── Helpers ───────────────────────────────────────────────
function formatDate(dateStr) {
if (!dateStr) return “Recently posted”;
const d = new Date(dateStr);
const days = Math.floor((Date.now() - d) / 86400000);
if (days === 0) return “Today”;
if (days === 1) return “Yesterday”;
if (days < 7)  return ${days} days ago;
if (days < 30) return ${Math.floor(days / 7)} weeks ago;
return “1+ month ago”;
}

// ── Airline Directory — All verified links ─────────────────
const AIRLINE_DIRECTORY = [
{ name:“American Airlines”,  url:“https://jobs.aa.com/search-jobs”,               color:”#E31837”, emoji:“plane” },
{ name:“Delta Air Lines”,    url:“https://delta.avature.net/en_US/careers”,       color:”#003B7B”, emoji:“plane” },
{ name:“United Airlines”,    url:“https://careers.united.com/us/en”,              color:”#0056A2”, emoji:“plane” },
{ name:“Southwest Airlines”, url:“https://careers.southwestair.com/us/en/”, color:”#304CB2”, emoji:“plane”  },
{ name:“JetBlue”,            url:“https://careers.jetblue.com”,                   color:”#00B2A9”, emoji:“plane” },
{ name:“Alaska Airlines”,    url:“https://careers.alaskaair.com/”,                    color:”#00537B”, emoji:“plane” },
{ name:“Frontier Airlines”,  url:“https://www.flyfrontier.com/Careers”,                  color:”#008000”, emoji:“plane” },
{ name:“Allegiant Air”,      url:“https://www.allegiantair.jobs/”,                 color:”#FF6600”, emoji:“plane” },
{ name:“Avelo Airlines”,     url:“https://www.aveloair.com/careers”,              color:”#5B0083”, emoji:“plane” },
{ name:“Sun Country”,        url:“https://www.suncountry.com/about/careers”,      color:”#FFD700”, emoji:“plane”  },
{ name:“Hawaiian Airlines”,  url:“https://careers.alaskaair.com/hawaiian-airlines/”,          color:”#6B1FAB”, emoji:“plane” },
{ name:“Breeze Airways”,     url:“https://jobs.flybreeze.com/”,             color:”#00A6D6”, emoji:“plane” },
{ name:“SkyWest Airlines”,   url:“https://www.skywest.com/skywest-airline-jobs/”, color:”#003366”, emoji:“plane” },
{ name:“Republic Airways”,   url:“https://rjet.com/careers/”,       color:”#CC0000”, emoji:“plane” },
{ name:“Envoy Air”,          url:“https://www.envoyair.com/careers/”,                  color:”#E31837”, emoji:“plane”  },
{ name:“PSA Airlines”,       url:"https://psaairlines.com/more-airline-careers/”,           color:”#004990”, emoji:“plane” },
{ name:“Piedmont Airlines”,  url:“https://www.piedmont-airlines.com/careers”,     color:”#003087”, emoji:“plane” },
{ name:“GoJet Airlines”,     url:“https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=a7828c0b-d30d-40a2-a3ee-61c80628985c&ccId=19000101_000001&lang=en_US”,         color:”#1A3F6F”, emoji:“plane” },
];

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(\n✈️  Wings Forward server running at http://localhost:${PORT});
console.log(`   Powered by Jooble — pulling from 1000+ job sites\n`);
});
