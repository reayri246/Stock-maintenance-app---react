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

    const customers = db
      .prepare(`
        SELECT *
        FROM customers
        ORDER BY id DESC
      `)
      .all();

    res.json(customers);

  }
);


router.post(
  "/",
  authenticateToken,
  (req, res) => {

    const {
      name,
      phone,
      email,
      address,
    } = req.body;


    if (!name) {

      return res.status(400).json({
        message: "Customer name required",
      });

    }


    const result = db
      .prepare(`
        INSERT INTO customers
        (
          name,
          phone,
          email,
          address
        )

        VALUES (?, ?, ?, ?)
      `)
      .run(
        name,
        phone || null,
        email || null,
        address || null
      );


    res.status(201).json({
      message: "Customer created",
      customerId:
        result.lastInsertRowid,
    });

  }
);


router.put(
  "/:id",
  authenticateToken,
  (req, res) => {
    const {
      name,
      phone,
      email,
      address,
      credit_balance,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Customer name required",
      });
    }

    const result = db
      .prepare(`
        UPDATE customers
        SET name = ?, phone = ?, email = ?, address = ?, credit_balance = ?
        WHERE id = ?
      `)
      .run(name, phone || null, email || null, address || null, credit_balance || 0, req.params.id);

    if (!result.changes) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({ message: "Customer updated" });
  }
);

router.delete(
  "/:id",
  authenticateToken,
  (req, res) => {

    const result = db
      .prepare(
        "DELETE FROM customers WHERE id = ?"
      )
      .run(req.params.id);


    if (!result.changes) {

      return res.status(404).json({
        message: "Customer not found",
      });

    }


    res.json({
      message: "Customer deleted",
    });

  }
);


export default router;