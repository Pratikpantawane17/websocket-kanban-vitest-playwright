const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const pool = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on("connection", async (socket) => {
  console.log("A user connected");

  // Send all tasks
  try {
    const [rows] = await pool.query("SELECT * FROM tasks");
    socket.emit("sync:tasks", rows);
  } catch (err) {
    console.error("Error syncing tasks:", err);
  }

  // Create task
  socket.on("task:create", async (taskData) => {
    const id = uuidv4();
    const {
      title = "Untitled Task",
      description = "",
      priority = "medium",
      category = "general",
      status = "todo",
      attachments = [],
    } = taskData;

    try {
      await pool.query(
        "INSERT INTO tasks (id, title, description, priority, category, status, attachments) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [id, title, description, priority, category, status, JSON.stringify(attachments)]
      );
      const newTask = { id, title, description, priority, category, status, attachments };
      io.emit("task:created", newTask);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  });

  // Update task
  socket.on("task:update", async (updatedTask) => {
    const { id, title, description, priority, category, status, attachments } = updatedTask;
    try {
      await pool.query(
        "UPDATE tasks SET title=?, description=?, priority=?, category=?, status=?, attachments=? WHERE id=?",
        [title, description, priority, category, status, JSON.stringify(attachments), id]
      );
      io.emit("task:updated", updatedTask);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  });

  // Move task
  socket.on("task:move", async ({ taskId, newColumn }) => {
    try {
      await pool.query("UPDATE tasks SET status=? WHERE id=?", [newColumn, taskId]);
      io.emit("task:moved", { taskId, newColumn });
    } catch (err) {
      console.error("Error moving task:", err);
    }
  });

  // Delete task
  socket.on("task:delete", async (taskId) => {
    try {
      await pool.query("DELETE FROM tasks WHERE id=?", [taskId]);
      io.emit("task:deleted", taskId);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
