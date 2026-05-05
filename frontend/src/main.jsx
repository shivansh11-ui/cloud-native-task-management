import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password");
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  async function login(event) {
    event.preventDefault();
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setMessage("Logged in successfully");
  }

  async function loadTasks() {
    const response = await fetch(`${API_URL}/api/tasks`, { headers });
    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem("token");
      setToken("");
      setTasks([]);
      setMessage(data.message || "Please login again");
      return;
    }

    setTasks(Array.isArray(data) ? data : []);
  }

  async function addTask(event) {
    event.preventDefault();
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title, priority })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Task creation failed");
      return;
    }

    setTitle("");
    setMessage("Task created and notification logged");
    loadTasks();
  }

  async function updateStatus(task, status) {
    await fetch(`${API_URL}/api/tasks/${task.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status })
    });
    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API_URL}/api/tasks/${id}`, { method: "DELETE", headers });
    loadTasks();
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setTasks([]);
  }

  if (!token) {
    return (
      <main className="auth">
        <section>
          <p className="eyebrow">Cloud Native Project</p>
          <h1>Task Management System with CI/CD Pipeline</h1>
          <p>
            A simple task app used to demonstrate Docker, Kubernetes, cloud deployment,
            and automated CI/CD.
          </p>
        </section>
        <form onSubmit={login} className="panel">
          <h2>Login</h2>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button>Login</button>
          {message && <p className="message">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">Cloud Native Task Management</p>
          <h1>Tasks</h1>
        </div>
        <button className="secondary" onClick={logout}>Logout</button>
      </header>

      <section className="grid">
        <form onSubmit={addTask} className="panel">
          <h2>Create Task</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter task title"
          />
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button>Add Task</button>
          {message && <p className="message">{message}</p>}
        </form>

        <section className="panel">
          <h2>Task List</h2>
          <div className="tasks">
            {tasks.map((task) => (
              <article key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.priority} priority</span>
                </div>
                <select value={task.status} onChange={(event) => updateStatus(task, event.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="danger" onClick={() => deleteTask(task.id)}>Delete</button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
