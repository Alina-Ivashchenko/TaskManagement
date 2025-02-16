import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [completerName, setCompleterName] = useState("");
    const [filterName, setFilterName] = useState("");

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://localhost:5001/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Create a task
    const createTask = async () => {
        if (!title) {
            alert("Title is required");
            return;
        }
        try {
            await axios.post("http://localhost:5001/tasks", { title, description });
            setTitle("");
            setDescription("");
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    // Mark a task as completed
    const completeTask = async (id) => {
        if (!completerName) {
            alert("Completer name is required");
            return;
        }
        try {
            await axios.put(`http://localhost:5001/tasks/${id}/complete`, { completer_name: completerName });
            setCompleterName("");
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    // Filter completed tasks by completer name
    const filterCompletedTasks = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/tasks/completed`, {
                params: {
                    completer_name: filterName,
                },
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error filtering tasks:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Task Management App</h1>

            {/* Task Creation Form */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Create Task</h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.input}
                />
                <button onClick={createTask} style={styles.button}>
                    Add Task
                </button>
            </div>

            {/* Task List */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Tasks</h2>
                <ul style={styles.taskList}>
                    {tasks
                        .filter((task) => !task.completed) // Show only uncompleted tasks
                        .map((task) => (
                            <li key={task.id} style={styles.taskItem}>
                                <h3 style={styles.taskTitle}>{task.title}</h3>
                                <p style={styles.taskDescription}>{task.description}</p>
                                {!task.completed && (
                                    <div style={styles.completeSection}>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={completerName}
                                            onChange={(e) => setCompleterName(e.target.value)}
                                            style={styles.input}
                                        />
                                        <button
                                            onClick={() => completeTask(task.id)}
                                            style={styles.completeButton}
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                                {task.completed && (
                                    <p style={styles.completedText}>Completed by: {task.completer_name}</p>
                                )}
                            </li>
                        ))}
                </ul>
            </div>

            {/* Filter Completed Tasks */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Filter Completed Tasks</h2>
                <input
                    type="text"
                    placeholder="Completer Name"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    style={styles.input}
                />
                <button onClick={filterCompletedTasks} style={styles.button}>
                    Filter
                </button>
            </div>

            {/* Completed Tasks List */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Completed Tasks</h2>
                <ul style={styles.taskList}>
                    {tasks
                        .filter((task) => task.completed) // Show only completed tasks
                        .map((task) => (
                            <li key={task.id} style={styles.taskItem}>
                                <h3 style={styles.taskTitle}>{task.title}</h3>
                                <p style={styles.taskDescription}>{task.description}</p>
                                <p style={styles.completedText}>Completed by: {task.completer_name}</p>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default App;

// Modern Styling
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    header: {
        fontSize: "2.5rem",
        color: "#333",
        marginBottom: "20px",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        margin: "10px 0",
        width: "100%",
        maxWidth: "600px",
    },
    sectionTitle: {
        fontSize: "1.5rem",
        color: "#333",
        marginBottom: "15px",
    },
    input: {
        width: "95%",
        padding: "10px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "1rem",
    },
    button: {
        backgroundColor: "#7A0019",
        color: "#fff",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "1rem",
        margin: "10px 0",
    },
    taskList: {
        listStyle: "none",
        padding: "0",
    },
    taskItem: {
        backgroundColor: "#f9f9f9",
        borderRadius: "5px",
        padding: "15px",
        margin: "10px 0",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    taskTitle: {
        fontSize: "1.2rem",
        color: "#333",
        marginBottom: "5px",
    },
    taskDescription: {
        fontSize: "1rem",
        color: "#555",
        marginBottom: "10px",
    },
    completeSection: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    },
    completeButton: {
        backgroundColor: "#28a745",
        color: "#fff",
        padding: "8px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "0.9rem",
    },
    completedText: {
        color: "#FFCC33",
        fontWeight: "bold",
    },
};