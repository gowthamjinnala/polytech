const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB CONNECTION
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", 
    database: "mugglestrip"
});

db.connect(err => {
    if (err) console.log("DB Error:", err);
    else console.log("MySQL Connected ✔");
});

// ---------------- AI LOGIC -----------------
function smartAI(budget, days, interests) {
  let hotel, travel, perDaySpend;

  if (budget < 5000) {
    hotel = "Hostel / Shared Dorm";
    travel = "Bus / Shared Auto";
    perDaySpend = 800;
  } else if (budget <= 15000) {
    hotel = "3-Star Budget Hotel";
    travel = "Scooter / City Bus";
    perDaySpend = 1500;
  } else {
    hotel = "4-Star Premium Stay";
    travel = "Private Cab / Rental";
    perDaySpend = 3000;
  }

  const interestMap = {
    beach: ["Water sports", "Sunset point", "Beach dinner"],
    adventure: ["Trekking", "Camping", "Rock climbing"],
    culture: ["Temple visit", "Museum tour", "Craft market"],
    food: ["Street food tour", "Restaurant hopping", "Night market"]
  };

  const activities = interestMap[interests] || ["City walk", "Shopping"];

  const totalCost = (perDaySpend * days) + budget * 0.10;

  return { hotel, travel, activities, totalCost };
}

// ---------------- GENERATE PLAN API -----------------
app.post("/api/generate-plan", (req, res) => {
  const { budget, start, end, interests } = req.body;

  const days = Math.ceil(
    (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
  );

  const plan = smartAI(Number(budget), days, interests);

  res.json({
    days,
    hotel: plan.hotel,
    travel: plan.travel,
    suggestedActivities: plan.activities,
    finalEstimatedCost: plan.totalCost
  });
});

// ---------------- SAVE PLAN API -----------------
app.post("/api/save-plan", (req, res) => {
  const { budget, start, end, interests, result } = req.body;

  db.query(
    "INSERT INTO plans (budget, start_date, end_date, interests, result) VALUES (?, ?, ?, ?, ?)",
    [budget, start, end, interests, JSON.stringify(result)],
    err => {
      if (err) res.json({ status: "error" });
      else res.json({ status: "saved" });
    }
  );
});

// ---------------- SERVER START -----------------
app.listen(5000, () =>
  console.log("Server running at http://localhost:5000")
);


app.post("/api/generate-plan", (req, res) => {
  const { budget, start, end, interests, location } = req.body;

  const days = Math.ceil(
    (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
  );

  // simple weather logic
  const weatherSuggestion = interests.includes("beach")
    ? "Carry sunscreen, light clothes, beach slippers"
    : "Carry jacket, shoes and water bottle";

  // safety suggestion
  const safety = [
    "Keep power bank charged",
    "Share live location with family",
    "Avoid late night travel in unknown places",
    "Keep soft copy of ID proofs"
  ];

  // Packing list
  const packing = [
    "ID card",
    "Power bank",
    "First aid kit",
    "2 Litre water bottle",
    "Weather appropriate clothes",
    "Chargers & earphones"
  ];

  // local spot logic
  const spots = [
    "Top-rated local market",
    "Museum / local heritage spot",
    "Sunset point / viewpoint"
  ];

  const baseCost = days * 1200;
  const hotel = days * 800;
  const travel = days * 300;
  const total = baseCost + hotel + travel;

  res.json({
    days,
    hotel: `₹${hotel}`,
    travel: `₹${travel}`,
    finalEstimatedCost: `₹${total}`,
    weatherSuggestion,
    safetyTips: safety,
    packingList: packing,
    suggestedSpots: spots,
    interests
  });
});
