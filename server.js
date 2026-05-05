var express = require(“express”);
var cors = require(“cors”);
var fetch = require(“node-fetch”);
require(“dotenv”).config();

var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(“public”));

var JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

var ROLE_QUERIES = {
“flight-attendant”: “flight attendant airline”,
“pilot”: “airline pilot first officer captain”,
“ramp-agent”: “ramp agent ground operations airline”,
“mechanic”: “aircraft mechanic aviation”,
“customer-service”: “airport customer service agent airline”,
“gate-agent”: “gate agent airline airport”,
“cargo”: “cargo handler airline airport”,
“corporate”: “airline operations coordinator aviation”
};

app.get(”/api/jobs”, async function(req, res) {
var role = req.query.role || “flight-attendant”;
var location = req.query.location || “United States”;
var keywords = ROLE_QUERIES[role] || role;

if (!JOOBLE_API_KEY) {
return res.status(500).json({ error: “JOOBLE_API_KEY not set” });
}

try {
var response = await fetch(“https://jooble.org/api/” + JOOBLE_API_KEY, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
keywords: keywords,
location: location,
page: “1”,
ResultOnPage: 20
})
});


var data = await response.json();

if (!data.jobs) {
  return res.status(502).json({ error: "No jobs returned from Jooble" });
}

var AIRLINES = [
  "american airlines", "delta air lines", "united airlines",
  "southwest airlines", "jetblue", "alaska airlines",
  "frontier airlines", "allegiant", "avelo", "spirit",
  "sun country", "hawaiian airlines", "breeze airways",
  "skywest", "envoy air", "republic airways", "psa airlines",
  "piedmont airlines", "gojet", "contour airlines"
];

var jobs = data.jobs.map(function(job) {
  return {
    id: job.id,
    title: job.title,
    employer: job.company || "Aviation Employer",
    location: job.location || location,
    type: job.type || "Full-time",
    salary: job.salary || null,
    posted: formatDate(job.updated),
    applyUrl: job.link,
    description: (job.snippet || "").slice(0, 300) + "...",
    isAirline: AIRLINES.some(function(a) {
      return (job.company || "").toLowerCase().indexOf(a) !== -1;
    }),
    logo: null
  };
});

jobs.sort(function(a, b) {
  return (b.isAirline ? 1 : 0) - (a.isAirline ? 1 : 0);
});

res.json({ jobs: jobs, total: jobs.length });


} catch (err) {
console.error(“Error:”, err);
res.status(500).json({ error: err.message });
}
});

app.get(”/api/airlines”, function(req, res) {
res.json([
{ name: “American Airlines”,  url: “https://jobs.aa.com/search-jobs”,               emoji: “plane” },
{ name: “Delta Air Lines”,    url: “https://delta.avature.net/en_US/careers”,       emoji: “plane” },
{ name: “United Airlines”,    url: “https://careers.united.com/us/en”,              emoji: “plane” },
{ name: “Southwest Airlines”, url: “https://careers.southwestairlines.com/careers”, emoji: “plane” },
{ name: “JetBlue”,            url: “https://careers.jetblue.com”,                   emoji: “plane” },
{ name: “Alaska Airlines”,    url: “https://jobs.alaskaair.com”,                    emoji: “plane” },
{ name: “Frontier Airlines”,  url: “https://jobs.flyfrontier.com”,                  emoji: “plane” },
{ name: “Allegiant Air”,      url: “https://jobs.allegiantair.com”,                 emoji: “plane” },
{ name: “Avelo Airlines”,     url: “https://www.aveloair.com/careers”,              emoji: “plane” },
{ name: “Sun Country”,        url: “https://www.suncountry.com/about/careers”,      emoji: “plane” },
{ name: “Hawaiian Airlines”,  url: “https://careers.hawaiianairlines.com”,          emoji: “plane” },
{ name: “Breeze Airways”,     url: “https://www.flybreeze.com/careers”,             emoji: “plane” },
{ name: “SkyWest Airlines”,   url: “https://www.skywest.com/about-skywest/careers”, emoji: “plane” },
{ name: “Republic Airways”,   url: “https://www.republicairways.com/careers”,       emoji: “plane” },
{ name: “Envoy Air”,          url: “https://envoyair.com/careers”,                  emoji: “plane” },
{ name: “PSA Airlines”,       url: “https://www.psaairlines.com/careers”,           emoji: “plane” },
{ name: “Piedmont Airlines”,  url: “https://www.piedmont-airlines.com/careers”,     emoji: “plane” },
{ name: “GoJet Airlines”,     url: “https://www.gojetairlines.com/careers”,         emoji: “plane” }
]);
});

function formatDate(dateStr) {
if (!dateStr) return “Recently posted”;
var d = new Date(dateStr);
var days = Math.floor((Date.now() - d) / 86400000);
if (days === 0) return “Today”;
if (days === 1) return “Yesterday”;
if (days < 7) return days + “ days ago”;
if (days < 30) return Math.floor(days / 7) + “ weeks ago”;
return “1+ month ago”;
}

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
console.log(“Wings Forward running on port “ + PORT);
});
