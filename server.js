var express = require(“express”);
var cors = require(“cors”);
var fetch = require(“node-fetch”);
var multer = require(“multer”);
var upload = multer({ storage: multer.memoryStorage() });
require(“dotenv”).config();

var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(“public”));

var JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
var ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

var ROLE_QUERIES = {
“flight-attendant”: “flight attendant airline”,
“pilot”: “airline pilot first officer captain”,
“ramp-agent”: “ramp agent ground operations airline”,
“mechanic”: “aircraft mechanic aviation”,
“customer-service”: “airport customer service agent airline”,
“gate-agent”: “gate agent airline airport”,
“cargo”: “cargo handler airline airport”,
“corporate”: “airline operations coordinator aviation”,
“facility”: “facility maintenance airline airport”,
“it-technology”: “IT technology airline aviation”,
“finance”: “finance accounting airline”,
“hr-training”: “human resources training airline”,
“security”: “security officer airline airport”,
“dispatcher”: “flight dispatcher airline operations”
};

var AIRLINES = [
“american airlines”,“delta air lines”,“united airlines”,
“southwest airlines”,“jetblue”,“alaska airlines”,
“frontier airlines”,“allegiant”,“avelo”,“spirit”,
“sun country”,“hawaiian airlines”,“breeze airways”,
“skywest”,“envoy air”,“republic airways”,“psa airlines”,
“piedmont airlines”,“gojet”,“contour airlines”
];

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

```
var data = await response.json();

if (!data.jobs) {
  return res.status(502).json({ error: "No jobs returned from Jooble" });
}

var jobs = data.jobs.map(function(j) {
  return {
    id: j.id,
    title: j.title,
    employer: j.company || "Aviation Employer",
    location: j.location || location,
    type: j.type || "Full-time",
    salary: j.salary || null,
    posted: j.updated || "Recently",
    applyUrl: j.link,
    snippet: (j.snippet || "").replace(/<[^>]*>/g, "").slice(0, 300),
    isAirline: AIRLINES.some(function(a) {
      return (j.company || "").toLowerCase().indexOf(a) !== -1;
    })
  };
});

jobs.sort(function(a, b) {
  return (b.isAirline ? 1 : 0) - (a.isAirline ? 1 : 0);
});

res.json({ jobs: jobs, total: jobs.length });
```

} catch(err) {
res.status(500).json({ error: err.message });
}
});

app.get(”/api/airlines”, function(req, res) {
res.json([
{ name: “American Airlines”, url: “https://jobs.aa.com/search-jobs” },
{ name: “Delta Air Lines”, url: “https://delta.avature.net/en_US/careers” },
{ name: “United Airlines”, url: “https://careers.united.com/us/en” },
{ name: “Southwest Airlines”, url: “https://careers.southwestairlines.com” },
{ name: “JetBlue”, url: “https://careers.jetblue.com” },
{ name: “Alaska Airlines”, url: “https://jobs.alaskaair.com” },
{ name: “Frontier Airlines”, url: “https://careers.flyfrontier.com” },
{ name: “Allegiant Air”, url: “https://jobs.allegiantair.com” },
{ name: “Avelo Airlines”, url: “https://www.aveloair.com/careers” },
{ name: “Sun Country”, url: “https://jobs.suncountry.com” },
{ name: “Hawaiian Airlines”, url: “https://careers.hawaiianairlines.com” },
{ name: “Breeze Airways”, url: “https://www.flybreeze.com/careers” },
{ name: “SkyWest Airlines”, url: “https://www.skywest.com/about-skywest/careers” },
{ name: “Republic Airways”, url: “https://www.republicairways.com/careers” },
{ name: “Envoy Air”, url: “https://envoyair.com/careers” },
{ name: “PSA Airlines”, url: “https://www.psaairlines.com/careers” },
{ name: “Piedmont Airlines”, url: “https://www.piedmont-airlines.com/careers” },
{ name: “GoJet Airlines”, url: “https://www.gojetairlines.com/careers” }
]);
});

app.post(”/api/tailor-resume”, upload.single(“resume”), async function(req, res) {
if (!ANTHROPIC_API_KEY) {
return res.status(500).json({ error: “ANTHROPIC_API_KEY not set” });
}

var jobTitle = req.body.jobTitle || “”;
var employer = req.body.employer || “”;
var jobSnippet = req.body.jobSnippet || “”;
var linkedinUrl = req.body.linkedinUrl || “”;
var resumeText = req.body.resumeText || “”;

if (req.file) {
resumeText = req.file.buffer.toString(“utf8”).replace(/[^\x20-\x7E\n]/g, “ “);
}

if (!resumeText && !linkedinUrl) {
return res.status(400).json({ error: “Please provide a resume or LinkedIn URL” });
}

var userContent = resumeText
? “Here is my current resume:\n\n” + resumeText
: “My LinkedIn profile URL is: “ + linkedinUrl + “\nPlease create a tailored resume based on typical Spirit Airlines employee experience.”;

var prompt = “You are an expert resume writer specializing in aviation industry careers.\n\n” +
“Job I am applying for:\n” +
“Title: “ + jobTitle + “\n” +
“Company: “ + employer + “\n” +
“Job Description: “ + jobSnippet + “\n\n” +
userContent + “\n\n” +
“Please rewrite and tailor this resume specifically for this job. Make it:\n” +
“1. ATS-friendly with relevant keywords from the job description\n” +
“2. Highlight Spirit Airlines experience that transfers to this role\n” +
“3. Professional and concise\n” +
“4. Include a strong summary at the top tailored to this specific role\n” +
“Format it as a clean professional resume ready to download.”;

try {
var response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“x-api-key”: ANTHROPIC_API_KEY,
“anthropic-version”: “2023-06-01”
},
body: JSON.stringify({
model: “claude-opus-4-5”,
max_tokens: 2000,
messages: [{ role: “user”, content: prompt }]
})
});

```
var data = await response.json();

if (data.error) {
  return res.status(500).json({ error: data.error.message });
}

var tailoredResume = data.content[0].text;
res.json({ resume: tailoredResume, jobTitle: jobTitle, employer: employer });
```

} catch(err) {
res.status(500).json({ error: err.message });
}
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
console.log(“Wings Forward running on port “ + PORT);
});
