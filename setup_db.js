const mysql = require("mysql2/promise");

async function initDB() {
  try {
    console.log("Attempting to connect with hardcoded credentials...");
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "gowthamjinnala@76", 
    }); 

    console.log("Connected to MySQL server.");

    await connection.query(`CREATE DATABASE IF NOT EXISTS mugglestrip`);
    console.log(`Database ensuring...`);

    await connection.changeUser({ database: 'mugglestrip' });

    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUsers);
    
    const createPlans = `
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        budget VARCHAR(20),
        start_date DATE,
        end_date DATE,
        interests TEXT,
        result TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;
    await connection.query(createPlans);

    await connection.end();
    console.log("Database setup complete.");
  } catch (err) {
    console.error("DB Setup Error:", err);
  }
}

initDB();
