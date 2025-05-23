-- 1. Creazione del database
DROP DATABASE IF EXISTS `dootdoot_db`;
CREATE DATABASE `dootdoot_db`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
USE `dootdoot_db`;

-- 2. Tabella utenti
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `school` VARCHAR(100) NOT NULL,
  `class` VARCHAR(50) NOT NULL,
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabella task e verifiche
CREATE TABLE `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `due_date` DATE NOT NULL,
  `is_test` TINYINT(1) NOT NULL DEFAULT 0,
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabella sessioni di studio
CREATE TABLE `study_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `task_id` INT DEFAULT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `notes` TEXT,
  `focus_score` TINYINT(1) DEFAULT NULL,
  `discipline_score` TINYINT(1) DEFAULT NULL,
  `efficiency_score` TINYINT(1) DEFAULT NULL,
  `dedication_score` TINYINT(1) DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabella statistiche aggregate (opzionale per caching)
CREATE TABLE `user_stats` (
  `user_id` INT PRIMARY KEY,
  `total_sessions` INT NOT NULL DEFAULT 0,
  `avg_focus` FLOAT NOT NULL DEFAULT 0,
  `avg_discipline` FLOAT NOT NULL DEFAULT 0,
  `avg_efficiency` FLOAT NOT NULL DEFAULT 0,
  `avg_dedication` FLOAT NOT NULL DEFAULT 0,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
