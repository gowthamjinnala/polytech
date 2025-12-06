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

// ---------------- SMART TRIP LOGIC -----------------
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

// ---------------- TRIP PLAN API -----------------
app.post("/api/generate-plan", (req, res) => {
  const { budget, start, end, interests } = req.body;

  const days = Math.ceil(
    (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
  );

  const basePlan = smartAI(Number(budget), days, interests);

  // additional logic
  const weatherSuggestion = interests === "beach"
    ? "Carry sunscreen, light clothes, beach slippers 🌴"
    : "Carry jacket, trekking shoes and water bottle 🏔";

  const safety = [
    "Keep power bank charged",
    "Share live location with family",
    "Avoid late-night travel",
    "Keep soft copy of ID proofs"
  ];

  const packing = [
    "ID card",
    "Power bank",
    "First aid kit",
    "2 Litre water bottle",
    "Weather appropriate clothes",
    "Chargers & earphones"
  ];

  const spots = [
    "Top-rated local market",
    "Museum / heritage site",
    "Sunset viewpoint / scenic spot"
  ];

  res.json({
    days,
    hotel: basePlan.hotel,
    travel: basePlan.travel,
    suggestedActivities: basePlan.activities,
    estimatedCost: basePlan.totalCost,
    weatherSuggestion,
    safetyTips: safety,
    packingList: packing,
    suggestedSpots: spots
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
  console.log("Server running at http://localhost:5000 🚀")
);
