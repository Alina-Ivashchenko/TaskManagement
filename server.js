import express from "express";
import { Client } from "pg"; // Using PostgreSQL client (pg)
import cors from "cors";
import process from 'process';

const app = express();
app.use(cors());
app.use(express.json());

// Supabase connection (PostgreSQL)
const client = new Client({
    connectionString: process.env.SUPABASE_URL, // Using Supabase URL as connection string
    ssl: { rejectUnauthorized: false }, // For secure connection, enable SSL for Supabase
    // For Supabase, you will typically use the service role key
    password: process.env.SUPABASE_KEY, // Use the Supabase Key as password
});

client.connect((err) => {
    if (err) {
        console.error("PostgreSQL connection failed:", err);
        process.exit(1); // Exit if DB connection fails
    }
    console.log("PostgreSQL connected");
});

// Create a task
app.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
    }

    const query = "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING id"; // PostgreSQL query format
    client.query(query, [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ message: "Task created", taskId: result.rows[0].id });
    });
});

// Get all tasks
app.get("/tasks", (req, res) => {
    const query = "SELECT * FROM tasks";
    client.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results.rows); // Use `.rows` for PostgreSQL results
    });
});

// Mark a task as completed
app.put("/tasks/:id/complete", (req, res) => {
    const { id } = req.params;
    const { completer_name } = req.body;

    if (!completer_name) {
        return res.status(400).json({ error: "Completer name is required" });
    }

    const query = "UPDATE tasks SET completed = TRUE, completer_name = $1 WHERE id = $2";
    client.query(query, [completer_name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json({ message: "Task marked as completed" });
    });
});

// Get completed tasks (filter by completer name)
app.get("/tasks/completed", (req, res) => {
    const { completer_name } = req.query;
    let query = "SELECT * FROM tasks WHERE completed = TRUE";
    const params = [];

    if (completer_name) {
        query += " AND completer_name = $1";
        params.push(completer_name);
    }

    client.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(200).json(results.rows); // Use `.rows` for PostgreSQL results
    });
});

// Start server
app.use(cors());
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
