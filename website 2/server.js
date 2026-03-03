const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API Endpoints

// Get all activities
app.get('/api/activities', (req, res) => {
    const sql = "SELECT * FROM activities ORDER BY created_at DESC";
    db.all(sql, [], (err, activities) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (activities.length === 0) {
            return res.json({ message: "success", data: [] });
        }

        // Fetch images for each activity
        const activitiesWithImages = [];
        let completed = 0;

        activities.forEach((activity, index) => {
            const imgSql = "SELECT image_path FROM activity_images WHERE activity_id = ?";
            db.all(imgSql, [activity.id], (err, rows) => {
                const images = rows ? rows.map(r => r.image_path) : [];
                // Include the main image_path as the first item if not already present
                if (activity.image_path && !images.includes(activity.image_path)) {
                    images.unshift(activity.image_path);
                }

                activitiesWithImages[index] = { ...activity, images };
                completed++;

                if (completed === activities.length) {
                    res.json({
                        message: "success",
                        data: activitiesWithImages
                    });
                }
            });
        });
    });
});

// Upload new activity
app.post('/api/activities', upload.array('images', 10), (req, res) => {
    const { title, description } = req.body;
    const files = req.files || [];

    // Use the first image as the main image_path for backward compatibility
    const main_image_path = files.length > 0 ? `/uploads/${files[0].filename}` : null;

    if (!title || !description || files.length === 0) {
        return res.status(400).json({ error: "Please provide title, description and at least one image." });
    }

    const sql = 'INSERT INTO activities (title, description, image_path) VALUES (?,?,?)';
    const params = [title, description, main_image_path];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        const activityId = this.lastID;
        const insertImgSql = 'INSERT INTO activity_images (activity_id, image_path) VALUES (?, ?)';

        // Insert all images into activity_images table
        let insertedCount = 0;
        files.forEach(file => {
            const imgPath = `/uploads/${file.filename}`;
            db.run(insertImgSql, [activityId, imgPath], (err) => {
                insertedCount++;
                if (insertedCount === files.length) {
                    res.json({
                        message: "success",
                        data: {
                            id: activityId,
                            title,
                            description,
                            image_path: main_image_path,
                            images: files.map(f => `/uploads/${f.filename}`)
                        }
                    });
                }
            });
        });
    });
});

// Delete an activity
app.delete('/api/activities/:id', (req, res) => {
    const { id } = req.params;

    // Optional: We can add logic to physically delete the image file from uploads/ here
    const sql = 'DELETE FROM activities WHERE id = ?';
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Activity not found." });
        }
        res.json({ message: "Activity deleted successfully", id });
    });
});

// ── Execom Photo Endpoints ──────────────────────────────────────────────────

// Get all execom photos
app.get('/api/execom-photos', (req, res) => {
    const sql = "SELECT * FROM execom_photos ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// Upload a new execom photo
app.post('/api/execom-photos', upload.single('image'), (req, res) => {
    const { caption } = req.body;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    if (!image_path) {
        return res.status(400).json({ error: "Please provide an image." });
    }

    const sql = 'INSERT INTO execom_photos (caption, image_path) VALUES (?,?)';
    db.run(sql, [caption || '', image_path], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: { id: this.lastID, caption, image_path } });
    });
});

// Delete an execom photo
app.delete('/api/execom-photos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM execom_photos WHERE id = ?';
    db.run(sql, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Photo not found." });
        res.json({ message: "Execom photo deleted successfully", id });
    });
});

// ── Upcoming Events Endpoints ──────────────────────────────────────────────

// Get all events
app.get('/api/events', (req, res) => {
    const sql = "SELECT * FROM upcoming_events ORDER BY date ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// Add a new event
app.post('/api/events', upload.single('image'), (req, res) => {
    const { title, date, location, description, link } = req.body;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !date || !location || !description) {
        return res.status(400).json({ error: "Please provide title, date, location, and description." });
    }

    const sql = 'INSERT INTO upcoming_events (title, date, location, description, image_path, link) VALUES (?,?,?,?,?,?)';
    const params = [title, date, location, description, image_path, link || ''];

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({
            message: "success",
            data: { id: this.lastID, title, date, location, description, image_path, link }
        });
    });
});

// Delete an event
app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM upcoming_events WHERE id = ?';
    db.run(sql, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Event not found." });
        res.json({ message: "Event deleted successfully", id });
    });
});

// ── Contact Information Endpoints ──────────────────────────────────────────

// Get contact info
app.get('/api/contact', (req, res) => {
    const sql = "SELECT * FROM contact_info WHERE id = 1";
    db.get(sql, [], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: row });
    });
});

// Update contact info
app.post('/api/contact', (req, res) => {
    const { email, phone, instagram_url, instagram_handle } = req.body;

    if (!email || !phone || !instagram_url || !instagram_handle) {
        return res.status(400).json({ error: "Please provide email, phone, and Instagram details." });
    }

    const sql = 'UPDATE contact_info SET email = ?, phone = ?, instagram_url = ?, instagram_handle = ? WHERE id = 1';
    db.run(sql, [email, phone, instagram_url, instagram_handle], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: { email, phone, instagram_url, instagram_handle } });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
