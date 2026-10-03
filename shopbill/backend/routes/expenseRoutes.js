import express from "express";

import db from "../config/database.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();


router.get(
  "/",
  authenticateToken,
  (req, res) => {

    const expenses =
      db
        .prepare(`
          SELECT *
          FROM expenses
          ORDER BY id DESC
        `)
        .all();


    res.json(expenses);

  }
);


router.post(
  "/",
  authenticateToken,
  (req, res) => {

    const {
      title,
      amount,
      category,
      description,
    } = req.body;


    if (
      !title ||
      !amount
    ) {

      return res.status(400).json({
        message:
          "Title and amount are required",
      });

    }


    const result =
      db
        .prepare(`
          INSERT INTO expenses
          (
            title,
            amount,
            category,
            description
          )

          VALUES (?, ?, ?, ?)
        `)
        .run(
          title,
          amount,
          category || null,
          description || null
        );


    res.status(201).json({
      message: "Expense added",

      expenseId:
        result.lastInsertRowid,
    });

  }
);


export default router;