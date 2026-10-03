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

    const suppliers = db
      .prepare(`
        SELECT *
        FROM suppliers
        ORDER BY id DESC
      `)
      .all();

    res.json(suppliers);

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
      gst_number,
      contact_person,
    } = req.body;


    if (!name) {

      return res.status(400).json({
        message: "Supplier name required",
      });

    }


    const result = db
      .prepare(`
        INSERT INTO suppliers
        (
          name,
          phone,
          email,
          address,
          gst_number,
          contact_person
        )

        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        name,
        phone || null,
        email || null,
        address || null,
        gst_number || null,
        contact_person || null
      );


    res.status(201).json({
      message: "Supplier created",

      supplierId:
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
      gst_number,
      contact_person,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Supplier name required",
      });
    }

    const result = db.prepare(`
      UPDATE suppliers
      SET name = ?, phone = ?, email = ?, address = ?, gst_number = ?, contact_person = ?
      WHERE id = ?
    `).run(name, phone || null, email || null, address || null, gst_number || null, contact_person || null, req.params.id);

    if (!result.changes) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier updated" });
  }
);

router.delete(
  "/:id",
  authenticateToken,
  (req, res) => {
    const result = db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);

    if (!result.changes) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier deleted" });
  }
);


export default router;