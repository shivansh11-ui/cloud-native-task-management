const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const { initializeDatabase, pool } = require("./db");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "local-demo-secret";
let databaseReady = false;

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
  res.json({
    status: "ok",
    service: "cloud-task-backend",
    database: databaseReady ? "connected" : "memory"
  });
});

app.get("/", (_req, res) => {
  res.json({
    service: "cloud-task-backend",
    status: "running",
    message: "Backend API is running",
    storage: databaseReady ? "postgres" : "memory",
    endpoints: {
      health: "/health",
      login: "POST /api/login",
      tasks: "/api/tasks"
    }
  });
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

app.get("/api/tasks", auth, async (_req, res) => {
  if (!databaseReady) {
    return res.json(tasks);
  }

  const result = await pool.query(`
    SELECT
      id::text,
      title,
      status,
      priority,
      created_at AS "createdAt"
    FROM tasks
    ORDER BY created_at DESC
  `);

  return res.json(result.rows);
});

app.post("/api/tasks", auth, async (req, res) => {
  const { title, priority = "medium" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }

  if (databaseReady) {
    const result = await pool.query(
      `
        INSERT INTO tasks (title, status, priority)
        VALUES ($1, $2, $3)
        RETURNING
          id::text,
          title,
          status,
          priority,
          created_at AS "createdAt"
      `,
      [title.trim(), "pending", priority]
    );

    const task = result.rows[0];
    console.log(`Notification: task created "${task.title}"`);
    return res.status(201).json(task);
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

app.put("/api/tasks/:id", auth, async (req, res) => {
  if (databaseReady) {
    const current = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);

    if (!current.rowCount) {
      return res.status(404).json({ message: "Task not found" });
    }

    const existing = current.rows[0];

    const result = await pool.query(
      `
        UPDATE tasks
        SET title = $1, status = $2, priority = $3
        WHERE id = $4
        RETURNING
          id::text,
          title,
          status,
          priority,
          created_at AS "createdAt"
      `,
      [
        req.body.title || existing.title,
        req.body.status || existing.status,
        req.body.priority || existing.priority,
        req.params.id
      ]
    );

    return res.json(result.rows[0]);
  }

  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  Object.assign(task, req.body);
  return res.json(task);
});

app.delete("/api/tasks/:id", auth, async (req, res) => {
  if (databaseReady) {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    return res.json({ message: "Task deleted" });
  }

  tasks = tasks.filter((item) => item.id !== req.params.id);
  return res.json({ message: "Task deleted" });
});

app.connectDatabase = async () => {
  try {
    databaseReady = await initializeDatabase();
  } catch (error) {
    databaseReady = false;
    console.error("PostgreSQL connection failed. Using temporary in-memory task storage.");
    console.error(error.message);
  }
};

module.exports = app;
