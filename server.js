const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- DB CONNECTION (Hardcoded as it was initially) ---
let db;
async function connectDB() {
    try {
        db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "your_mysql_root_password_here", 
            database: "mugglestrip"
        });
        console.log("MySQL Connected ✔");
    } catch (err) {
        console.error("DB Error:", err);
    }
}
connectDB();

// --- MOCK AI GENERATOR ---
function generatePlanWithAI(budget, days, interests, location) {
    const totalBudget = Number(budget);
    const costFactor = totalBudget / days; 
    
    // Simulate API logic
    const flightCost = Math.round(totalBudget * 0.25 + (Math.random() * 2000));
    const hotelCostPerNight = Math.round(Math.max(800, totalBudget * 0.4 / days) + (Math.random() * 500));
    const foodAndActivitiesPerDay = Math.round(Math.max(1000, costFactor * 0.3));

    const totalCalculatedCost = flightCost + (hotelCostPerNight * days) + (foodAndActivitiesPerDay * days);

    const interestMap = {
        beach: ["Day trip to hidden cove", "Sunset cruise and dining", "Local seafood cooking class"],
        adventure: ["Guided trekking trail", "Rock climbing or zip-lining", "Off-road safari"],
        culture: ["Visit ancient temples/monuments", "Local craft market immersion", "Folklore show"],
        food: ["Best street food tour", "Fine dining experience", "Visit a vineyard/brewery"]
    };

    const suggestedActivities = interests.flatMap(int => interestMap[int] || ["City Explore"]);

    const dailyPlan = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        activity: suggestedActivities[i % suggestedActivities.length] || "Explore the local town square.",
    }));
    
    const aiGeneratedTips = [
        `Since your budget is ${totalBudget > 20000 ? 'high' : 'standard'}, consider private transfers.`,
        `Always keep a printed map of ${location} as cell service can be spotty.`,
        `Check local weather in ${location}.`
    ];

    return {
        days,
        flight: Math.round(flightCost),
        hotelPerNight: Math.round(hotelCostPerNight),
        foodAndActivitiesPerDay: foodAndActivitiesPerDay,
        dailyPlan,
        suggestedActivities,
        finalEstimatedCost: totalCalculatedCost,
        aiGeneratedTips
    };
}

// --- API ENDPOINTS ---

app.post("/api/generate-plan", (req, res) => {
    const { budget, start, end, interests, location } = req.body;
    
    if (!budget || !start || !end) {
        return res.status(400).json({ status: "error", message: "Missing fields" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if(days < 1) return res.status(400).json({status: "error", message: "Invalid dates"});

    const plan = generatePlanWithAI(budget, days, interests, location);

    res.json({
        status: "success",
        ...plan,
        interests
    });
});

app.post("/api/save-plan", async (req, res) => {
  const { budget, start, end, interests, result } = req.body;

  if (!db) {
    return res.status(503).json({ status: "error", message: "Database not connected." });
  }

  try {
    const interestsString = Array.isArray(interests) ? interests.join(',') : interests;
    const resultJson = JSON.stringify(result);

    await db.execute(
      "INSERT INTO plans (budget, start_date, end_date, interests, result) VALUES (?, ?, ?, ?, ?)",
      [budget, start, end, interestsString, resultJson]
    );
    
    res.json({ status: "saved", message: "Plan successfully saved." });
  } catch (err) {
    console.error("Save Plan Error:", err);
    res.status(500).json({ status: "error", message: "Failed to save plan." });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));