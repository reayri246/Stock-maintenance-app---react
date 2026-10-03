import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../config/database.js";

const router = express.Router();


/*
  REGISTER
*/

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
    } = req.body;

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
        (name, email, password)
        VALUES (?, ?, ?)
      `)
      .run(
        name,
        email,
        hashedPassword
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