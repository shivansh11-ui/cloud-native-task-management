const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "local-demo-secret";

let tasks = [
  {
    id: "1",
    title: "Build Docker image",
    status: "pending",
    priority: "high",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Run CI/CD pipeline",
    status: "in-progress",
    priority: "medium",
    createdAt: new Date().toISOString()
  }
];

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(morgan("dev"));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cloud-task-backend" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = { id: "demo-user", email };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ user, token });
});

app.get("/api/tasks", auth, (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", auth, (req, res) => {
  const { title, priority = "medium" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }

  const task = {
    id: String(Date.now()),
    title: title.trim(),
    status: "pending",
    priority,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  console.log(`Notification: task created "${task.title}"`);
  return res.status(201).json(task);
});

app.put("/api/tasks/:id", auth, (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  Object.assign(task, req.body);
  return res.json(task);
});

app.delete("/api/tasks/:id", auth, (req, res) => {
  tasks = tasks.filter((item) => item.id !== req.params.id);
  return res.json({ message: "Task deleted" });
});

module.exports = app;
