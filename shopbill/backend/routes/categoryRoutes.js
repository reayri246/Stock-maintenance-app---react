import express from "express";
import db from "../config/database.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  const categories = db
    .prepare(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id DESC
    `)
    .all();

  res.json(categories);
});

router.post("/", authenticateToken, (req, res) => {
  const { name, description, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const result = db
      .prepare(`
        INSERT INTO categories (name, description, status)
        VALUES (?, ?, ?)
      `)
      .run(name, description || null, status || "active");

    res.status(201).json({
      message: "Category created",
      categoryId: result.lastInsertRowid,
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Category name already exists" });
    }

    return res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/:id", authenticateToken, (req, res) => {
  const { name, description, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const result = db
    .prepare(`
      UPDATE categories
      SET name = ?, description = ?, status = ?
      WHERE id = ?
    `)
    .run(name, description || null, status || "active", req.params.id);

  if (!result.changes) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json({ message: "Category updated" });
});

router.delete("/:id", authenticateToken, (req, res) => {
  const check = db.prepare("SELECT COUNT(*) AS count FROM products WHERE category_id = ?").get(req.params.id);

  if (check.count > 0) {
    return res.status(400).json({
      message: "Category is still assigned to products. Reassign or delete products first.",
    });
  }

  const result = db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);

  if (!result.changes) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.json({ message: "Category deleted" });
});

export default router;
