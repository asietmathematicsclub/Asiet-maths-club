const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.run(`CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating activities table " + err.message);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS activity_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error("Error creating activity_images table " + err.message);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS execom_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caption TEXT,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating execom_photos table " + err.message);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS upcoming_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            date TEXT,
            location TEXT,
            description TEXT,
            image_path TEXT,
            link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating upcoming_events table " + err.message);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS contact_info (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            email TEXT,
            phone TEXT,
            instagram_url TEXT,
            instagram_handle TEXT
        )`, (err) => {
            if (err) {
                console.error("Error creating contact_info table " + err.message);
            } else {
                // Initialize if empty
                db.get("SELECT count(*) as count FROM contact_info", [], (err, row) => {
                    if (row && row.count === 0) {
                        db.run(`INSERT INTO contact_info (id, email, phone, instagram_url, instagram_handle) 
                                VALUES (1, ?, ?, ?, ?)`,
                            ["asietmathematicsclub1234@gmail.com", "+91 7736858318", "https://www.instagram.com/mathsclub_asiet", "@mathsclub_asiet"]);
                    }
                });
            }
        });
    }
});

module.exports = db;
