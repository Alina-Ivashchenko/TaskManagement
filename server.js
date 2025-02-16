import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Login123",  
    database: "task_manager",
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        process.exit(1); // Exit if DB connection fails
    }
    console.log("MySQL connected");
});

// Create a task
app.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    const query = "INSERT INTO tasks (title, description) VALUES (?, ?)";
    db.query(query, [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Task created", taskId: result.insertId });
    });
});

// Get all tasks
app.get("/tasks", (req, res) => {
    const query = "SELECT * FROM tasks";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results);
    });
});

// Mark a task as completed
app.put("/tasks/:id/complete", (req, res) => {
    const { id } = req.params;
    const { completer_name } = req.body;

    if (!completer_name) {
        return res.status(400).json({ error: "Completer name is required" });
    }

    const query = "UPDATE tasks SET completed = 1, completer_name = ? WHERE id = ?";
    db.query(query, [completer_name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task marked as completed" });
    });
});

// Get completed tasks (filter by completer name)
app.get("/tasks/completed", (req, res) => {
    const { completer_name } = req.query;
    let query = "SELECT * FROM tasks WHERE completed = 1";
    const params = [];

    if (completer_name) {
        query += " AND completer_name = ?";
        params.push(completer_name);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results);
    });
});

// Start server
app.use(cors());
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
