-- Database: dootdoot
CREATE DATABASE IF NOT EXISTS dootdoot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dootdoot;

-- Tabella utenti
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    school VARCHAR(100),
    class VARCHAR(20),
    profile_img VARCHAR(255) DEFAULT 'uploads/default.png',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task e verifiche
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE,
    is_test BOOLEAN DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessioni di studio
CREATE TABLE IF NOT EXISTS study_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    notes TEXT,
    focus_score TINYINT UNSIGNED,
    discipline_score TINYINT UNSIGNED,
    efficiency_score TINYINT UNSIGNED,
    dedication_score TINYINT UNSIGNED,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Statistiche aggregate per utente (opzionale ma utile per dashboard)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id INT PRIMARY KEY,
    total_sessions INT DEFAULT 0,
    avg_focus FLOAT DEFAULT 0,
    avg_discipline FLOAT DEFAULT 0,
    avg_efficiency FLOAT DEFAULT 0,
    avg_dedication FLOAT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- To-do giornaliero (collegato a task opzionali)
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT,  -- Può essere NULL se è un to-do generico
    title VARCHAR(100) NOT NULL,
    is_done BOOLEAN DEFAULT 0,
    target_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);