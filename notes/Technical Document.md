
## Struttura delle cartelle

/dootdoot/
│
├── /www/                      # Cartella principale Cordova
│   ├── /assets/              # CSS, JS, immagini
│   │   ├── /css/
│   │   ├── /js/
│   │   └── /img/
│   ├── /components/          # Moduli HTML riutilizzabili
│   ├── /pages/               # Pagine principali (login, dashboard, ecc.)
│   ├── /services/            # Chiamate API lato client (AJAX)
│   └── index.html
│
├── /api/                     # Backend PHP
│   ├── /auth/                # Login, registrazione
│   ├── /tasks/               # Gestione Task, Verifiche
│   ├── /sessions/           # Sessioni di studio + timer
│   ├── /stats/              # Statistiche e metriche
│   ├── /feedback/           # Feedback post sessione
│   ├── /profile/            # Dati utente
│   └── config.php           # Connessione al DB
│
├── /sql/                     # Script SQL
│   └── schema.sql
│
└── config.xml                # Configurazione Cordova

## Stack tecnologico preciso

|Componente|Tecnologia|
|---|---|
|**Frontend**|HTML5, CSS3, JavaScript Vanilla|
|**Mobile wrapper**|Apache Cordova|
|**Backend API**|PHP 8.x (modulare, RESTful)|
|**Database**|MySQL via XAMPP (phpMyAdmin)|
|**Hosting dev**|XAMPP localhost|
|**Styling**|CSS Custom / Bootstrap 5 (lightweight)|
|**Interazioni**|Fetch API (AJAX)|

## Architettura logica e flusso utenti

### **User Flow principale:**

1. **Autenticazione**: login / registrazione
    
2. **Dashboard**:
    
    - To-Do giornaliero
        
    - Sessione attiva (con timer)
        
    - Statistiche rapide
        
3. **Navigazione a moduli**:
    
    - Task e Verifiche
        
    - Sessioni Studio
        
    - Feedback
        
    - Statistiche avanzate
        
    - Profilo
        

### **Interazioni Backend/API (semplificato)**

- `POST /auth/login.php` – login utente
    
- `POST /auth/register.php` – nuova registrazione
    
- `GET /tasks/list.php` – lista task utente
    
- `POST /tasks/add.php` – nuovo task
    
- `POST /sessions/start.php` – inizio sessione
    
- `POST /sessions/end.php` – fine sessione con feedback
    
- `GET /stats/user.php` – metriche utente
    
- `POST /profile/update.php` – modifica profilo

## Schema Database relazionale

`-- Utenti`
`CREATE TABLE users (`
    `id INT AUTO_INCREMENT PRIMARY KEY,`
    `username VARCHAR(50) UNIQUE NOT NULL,`
    `email VARCHAR(100) UNIQUE NOT NULL,`
    `password_hash VARCHAR(255) NOT NULL,`
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
`);`

`-- Task e Verifiche`
`CREATE TABLE tasks (`
    `id INT AUTO_INCREMENT PRIMARY KEY,`
    `user_id INT,`
    `title VARCHAR(100),`
    `description TEXT,`
    `due_date DATE,`
    `is_test BOOLEAN DEFAULT 0,`
    `completed BOOLEAN DEFAULT 0,`
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`
    `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
`);`

`-- Sessioni di studio`
`CREATE TABLE study_sessions (`
    `id INT AUTO_INCREMENT PRIMARY KEY,`
    `user_id INT,`
    `start_time DATETIME,`
    `end_time DATETIME,`
    `duration_minutes INT,`
    `notes TEXT,`
    `focus_score TINYINT,        -- 1-10`
    `discipline_score TINYINT,   -- 1-10`
    `efficiency_score TINYINT,   -- 1-10`
    `dedication_score TINYINT,   -- 1-10`
    `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
`);`

`-- Statistiche aggregate (opzionale per caching)`
`CREATE TABLE user_stats (`
    `user_id INT PRIMARY KEY,`
    `total_sessions INT DEFAULT 0,`
    `avg_focus FLOAT DEFAULT 0,`
    `avg_discipline FLOAT DEFAULT 0,`
    `avg_efficiency FLOAT DEFAULT 0,`
    `avg_dedication FLOAT DEFAULT 0,`
    `last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`
    `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
`);`
