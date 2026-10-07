import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../config/database.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


/*
  REGISTER
*/

router.post("/register", authenticateToken, async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role = "staff",
    } = req.body;

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can create staff accounts",
      });
    }

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const allowedRoles = ["admin", "cashier", "inventory", "staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    const existingUser = db
      .prepare(
        "SELECT id FROM users WHERE email = ?"
      )
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const result = db
      .prepare(`
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        name,
        email,
        hashedPassword,
        role
      );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.lastInsertRowid,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });

  }

});


/*
  LOGIN
*/

router.get("/me", authenticateToken, (req, res) => {
  const user = db
    .prepare(
      "SELECT id, name, email, role FROM users WHERE id = ?"
    )
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    user,
  });
});

router.get("/staff", authenticateToken, requireAdmin, (req, res) => {
  const staff = db
    .prepare(
      "SELECT id, name, email, role FROM users ORDER BY id ASC"
    )
    .all();

  res.json({
    staff,
  });
});

router.delete("/users/:id", authenticateToken, requireAdmin, (req, res) => {
  const userId = Number(req.params.id);
  const currentUser = req.user.id;

  if (!userId || userId === currentUser) {
    return res.status(400).json({
      message: "You cannot delete your own account from this action.",
    });
  }

  const user = db
    .prepare("SELECT id, name, email FROM users WHERE id = ?")
    .get(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  res.json({
    message: `User ${user.name} deleted successfully`,
  });
});

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    const user = db
      .prepare(
        "SELECT * FROM users WHERE email = ?"
      )
      .get(email);

    if (!user) {

      return res.status(401).json({
        message: "Invalid email or password",
      });

    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {

      return res.status(401).json({
        message: "Invalid email or password",
      });

    }

    const token =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });

  }

});


export default router;