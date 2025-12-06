CREATE DATABASE mugglestrip;

CREATE TABLE plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget VARCHAR(20),
  start_date DATE,
  end_date DATE,
  interests TEXT,
  result TEXT
);


