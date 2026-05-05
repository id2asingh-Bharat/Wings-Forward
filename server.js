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
{ name:“American Airlines”,  url:“https://jobs.aa.com/search-jobs”,               color:”#E31837”, emoji:“🦅” },
{ name:“Delta Air Lines”,    url:“https://delta.avature.net/en_US/careers”,       color:”#003B7B”, emoji:“🔵” },
{ name:“United Airlines”,    url:“https://careers.united.com/us/en”,              color:”#0056A2”, emoji:“🌐” },
{ name:“Southwest Airlines”, url:“https://careers.southwestairlines.com/careers”, color:”#304CB2”, emoji:“❤️”  },
{ name:“JetBlue”,            url:“https://careers.jetblue.com”,                   color:”#00B2A9”, emoji:“🩵” },
{ name:“Alaska Airlines”,    url:“https://jobs.alaskaair.com”,                    color:”#00537B”, emoji:“🐺” },
{ name:“Frontier Airlines”,  url:“https://jobs.flyfrontier.com”,                  color:”#008000”, emoji:“🌿” },
{ name:“Allegiant Air”,      url:“https://jobs.allegiantair.com”,                 color:”#FF6600”, emoji:“🟠” },
{ name:“Avelo Airlines”,     url:“https://www.aveloair.com/careers”,              color:”#5B0083”, emoji:“🟣” },
{ name:“Sun Country”,        url:“https://www.suncountry.com/about/careers”,      color:”#FFD700”, emoji:“☀️”  },
{ name:“Hawaiian Airlines”,  url:“https://careers.hawaiianairlines.com”,          color:”#6B1FAB”, emoji:“🌺” },
{ name:“Breeze Airways”,     url:“https://www.flybreeze.com/careers”,             color:”#00A6D6”, emoji:“🫧” },
{ name:“SkyWest Airlines”,   url:“https://www.skywest.com/about-skywest/careers”, color:”#003366”, emoji:“⭐” },
{ name:“Republic Airways”,   url:“https://www.republicairways.com/careers”,       color:”#CC0000”, emoji:“🔴” },
{ name:“Envoy Air”,          url:“https://envoyair.com/careers”,                  color:”#E31837”, emoji:“✈️”  },
{ name:“PSA Airlines”,       url:“https://www.psaairlines.com/careers”,           color:”#004990”, emoji:“🔷” },
{ name:“Piedmont Airlines”,  url:“https://www.piedmont-airlines.com/careers”,     color:”#003087”, emoji:“🦋” },
{ name:“GoJet Airlines”,     url:“https://www.gojetairlines.com/careers”,         color:”#1A3F6F”, emoji:“🚀” },
];

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(\n✈️  Wings Forward server running at http://localhost:${PORT});
console.log(`   Powered by Jooble — pulling from 1000+ job sites\n`);
});
