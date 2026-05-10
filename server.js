var express = require("express");
var cors = require("cors");
var fetch = require("node-fetch");
require("dotenv").config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
var JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log("Running on port " + PORT); });
app.get("/api/jobs", async function(req, res) {
var role = req.query.role || "flight-attendant";
var location = req.query.location || "United States";
if (!JOOBLE_API_KEY) { return res.status(500).json({ error: "No API key" }); }
try {
var response = await fetch("https://jooble.org/api/" + JOOBLE_API_KEY, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ keywords: role, location: location, page: "1", ResultOnPage: 20 })
    });
var data = await response.json();
if (!data.jobs) { return res.status(502).json({ error: "No jobs" }); }
res.json({ jobs: data.jobs, total: data.jobs.length });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
