CREATE DATABASE IF NOT EXISTS mugglestrip;
USE mugglestrip;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  budget VARCHAR(20),
  start_date DATE,
  end_date DATE,
  interests TEXT,
  result TEXT, -- Storing JSON as TEXT for simplicity
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);