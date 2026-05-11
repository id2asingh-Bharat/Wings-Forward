var express = require("express");
var cors = require("cors");
var fetch = require("node-fetch");
require("dotenv").config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
var JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
var ROLE_QUERIES = {"flight-attendant":"flight attendant airline","pilot":"airline pilot first officer","ramp-agent":"ramp agent ground operations","mechanic":"aircraft mechanic aviation","customer-service":"airport customer service airline","gate-agent":"gate agent airline","cargo":"cargo handler airline","corporate":"airline operations coordinator","facility":"facility maintenance airline airport","it-technology":"IT technology airline aviation","finance":"finance accounting airline","hr-training":"human resources training airline","security":"security officer airline airport","dispatcher":"flight dispatcher airline"};
var PORT = process.env.PORT || 3000;
app.get("/api/jobs", async function(req, res) {
var role = req.query.role || "flight-attendant";
var keywords = ROLE_QUERIES[role] || role;
var location = req.query.location || "United States";
if (!JOOBLE_API_KEY) { return res.status(500).json({ error: "No API key" }); }
try {
var response = await fetch("https://jooble.org/api/" + JOOBLE_API_KEY, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ keywords: keywords, location: location, page: "1", ResultOnPage: 20 })
    });
var data = await response.json();
if (!data.jobs) { return res.status(502).json({ error: "No jobs" }); }
res.json({ jobs: data.jobs.map(function(j){ return { title: j.title, employer: j.company||"Aviation", location: j.location||"", type: j.type||"Full-time", salary: j.salary||"", posted: j.updated||"", applyUrl: j.link, isAirline: ["american","delta","united","southwest","jetblue","alaska","frontier","allegiant","avelo","hawaiian","breeze","skywest","envoy","republic","psa","piedmont","gojet"].some(function(a){return(j.company||"").toLowerCase().indexOf(a)!==-1;}) }; }), total: data.jobs.length });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/jobs", async function(req, res) {
  var role = req.query.role || "flight-attendant";
  var location = req.query.location || "United States";
  if (!JOOBLE_API_KEY) { return res.status(500).json({ error: "No API key" }); }
  try {
    var response = await fetch("https://jooble.org/api/" + JOOBLE_API_KEY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords: role, location: location, page: "1", ResultOnPage: 20 }) });
    var data = await response.json();
    if (!data.jobs) { return res.status(502).json({ error: "No jobs" }); }
res.json({ jobs: data.jobs.map(function(j){ return { title: j.title, employer: j.company||"Aviation", location: j.location||"", type: j.type||"Full-time", salary: j.salary||"", posted: j.updated||"", applyUrl: j.link, isAirline: ["american","delta","united","southwest","jetblue","alaska","frontier","allegiant","avelo","hawaiian","breeze","skywest","envoy","republic","psa","piedmont","gojet"].some(function(a){return(j.company||"").toLowerCase().indexOf(a)!==-1;}) }; }), total: data.jobs.length });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/airlines", function(req, res) {
  res.json([
    { name: "American Airlines", url: "https://jobs.aa.com/search-jobs" },
    { name: "Delta Air Lines", url: "https://delta.avature.net/en_US/careers" },
    { name: "United Airlines", url: "https://careers.united.com/us/en" },
    { name: "Southwest Airlines", url: "https://careers.southwestair.com/us/en/" },
    { name: "JetBlue", url: "https://careers.jetblue.com" },
    { name: "Alaska Airlines", url: "https://careers.alaskaair.com/" },
    { name: "Frontier Airlines", url: "https://www.flyfrontier.com/Careers" },
    { name: "Allegiant Air", url: "https://www.allegiantair.jobs/see-all-jobs/" },
    { name: "Sun Country", url: "https://careers.suncountry.com/" },
    { name: "Hawaiian Airlines", url: "https://careers.alaskaair.com/hawaiian-airlines/" },
    { name: "Breeze Airways", url: "https://jobs.flybreeze.com/" },
    { name: "SkyWest Airlines", url: "https://www.skywest.com/skywest-airline-jobs/" },
    { name: "Republic Airways", url: "https://rjet.com/careers/" },
    { name: "Envoy Air", url: "https://envoyair.com/careers" },
    { name: "PSA Airlines", url: "https://www.psaairlines.com/careers" },
    { name: "Piedmont Airlines", url: "https://www.piedmont-airlines.com/careers" },
    { name: "GoJet Airlines", url: "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=a7828c0b-d30d-40a2-a3ee-61c80628985c&ccId=19000101_000001&lang=en_US" }
  ]);
});
app.listen(PORT, function() { console.log("Running on port " + PORT); });
