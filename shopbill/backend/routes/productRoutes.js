import express from "express";

import db from "../config/database.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();


/*
  GET ALL PRODUCTS
*/

router.get(
  "/",
  authenticateToken,
  (req, res) => {

    const products = db
      .prepare(`
        SELECT
          products.*,
          categories.name AS category_name

        FROM products

        LEFT JOIN categories
          ON products.category_id =
             categories.id

        ORDER BY products.id DESC
      `)
      .all();

    res.json(products);
  }
);


/*
  GET SINGLE PRODUCT
*/

router.get(
  "/:id",
  authenticateToken,
  (req, res) => {

    const product = db
      .prepare(`
        SELECT
          products.*,
          categories.name AS category_name

        FROM products

        LEFT JOIN categories
          ON products.category_id =
             categories.id

        WHERE products.id = ?
      `)
      .get(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  }
);


/*
  ADD PRODUCT
*/

router.post(
  "/",
  authenticateToken,
  (req, res) => {

    try {

      const {
        name,
        sku,
        barcode,
        category_id,
        purchase_price,
        selling_price,
        stock,
        minimum_stock,
        unit,
        tax,
      } = req.body;


      if (!name || !sku) {
        return res.status(400).json({
          message:
            "Product name and SKU are required",
        });
      }


      const result = db
        .prepare(`
          INSERT INTO products
          (
            name,
            sku,
            barcode,
            category_id,
            purchase_price,
            selling_price,
            stock,
            minimum_stock,
            unit,
            tax
          )

          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          name,
          sku,
          barcode || null,
          category_id || null,
          purchase_price || 0,
          selling_price || 0,
          stock || 0,
          minimum_stock || 5,
          unit || "pcs",
          tax || 0
        );


      res.status(201).json({
        message: "Product created",

        productId:
          result.lastInsertRowid,
      });

    } catch (error) {

      if (
        error.code ===
        "SQLITE_CONSTRAINT_UNIQUE"
      ) {

        return res.status(409).json({
          message:
            "SKU or barcode already exists",
        });

      }

      res.status(500).json({
        message: "Failed to create product",
      });

    }
  }
);


/*
  UPDATE PRODUCT
*/

router.put(
  "/:id",
  authenticateToken,
  (req, res) => {

    const {
      name,
      sku,
      barcode,
      category_id,
      purchase_price,
      selling_price,
      stock,
      minimum_stock,
      unit,
      tax,
    } = req.body;


    const result = db
      .prepare(`
        UPDATE products

        SET
          name = ?,
          sku = ?,
          barcode = ?,
          category_id = ?,
          purchase_price = ?,
          selling_price = ?,
          stock = ?,
          minimum_stock = ?,
          unit = ?,
          tax = ?,
          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = ?
      `)
      .run(
        name,
        sku,
        barcode || null,
        category_id || null,
        purchase_price || 0,
        selling_price || 0,
        stock || 0,
        minimum_stock || 5,
        unit || "pcs",
        tax || 0,
        req.params.id
      );


    if (!result.changes) {

      return res.status(404).json({
        message: "Product not found",
      });

    }


    res.json({
      message: "Product updated",
    });

  }
);


/*
  DELETE PRODUCT
*/

router.delete(
  "/:id",
  authenticateToken,
  (req, res) => {

    const result = db
      .prepare(
        "DELETE FROM products WHERE id = ?"
      )
      .run(req.params.id);


    if (!result.changes) {

      return res.status(404).json({
        message: "Product not found",
      });

    }


    res.json({
      message: "Product deleted",
    });

  }
);


export default router;