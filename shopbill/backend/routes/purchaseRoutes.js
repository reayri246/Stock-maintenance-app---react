import express from "express";

import db from "../config/database.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

const router = express.Router();


router.post(
  "/",
  authenticateToken,
  (req, res) => {

    try {

      const {
        supplier_id,
        items,
        discount = 0,
      } = req.body;


      if (
        !items ||
        items.length === 0
      ) {

        return res.status(400).json({
          message: "Purchase items required",
        });

      }


      const transaction =
        db.transaction(() => {

          let subtotal = 0;


          for (const item of items) {

            const total =
              Number(item.price) *
              Number(item.quantity);

            subtotal += total;

          }


          const total =
            subtotal -
            Number(discount);


          const purchaseNumber =
            `PUR-${Date.now()}`;


          const purchase =
            db
              .prepare(`
                INSERT INTO purchases
                (
                  purchase_number,
                  supplier_id,
                  subtotal,
                  discount,
                  total
                )

                VALUES (?, ?, ?, ?, ?)
              `)
              .run(
                purchaseNumber,
                supplier_id || null,
                subtotal,
                discount,
                total
              );


          const purchaseId =
            purchase.lastInsertRowid;


          const insertItem =
            db.prepare(`
              INSERT INTO purchase_items
              (
                purchase_id,
                product_id,
                quantity,
                price,
                total
              )

              VALUES (?, ?, ?, ?, ?)
            `);


          const increaseStock =
            db.prepare(`
              UPDATE products

              SET
                stock = stock + ?,
                purchase_price = ?,
                updated_at =
                  CURRENT_TIMESTAMP

              WHERE id = ?
            `);


          for (const item of items) {

            const itemTotal =
              Number(item.price) *
              Number(item.quantity);


            insertItem.run(
              purchaseId,
              item.product_id,
              item.quantity,
              item.price,
              itemTotal
            );


            increaseStock.run(
              item.quantity,
              item.price,
              item.product_id
            );

          }


          return {
            purchaseId,
            purchaseNumber,
            subtotal,
            discount,
            total,
          };

        });


      res.status(201).json({
        message:
          "Purchase recorded successfully",

        purchase: transaction(),
      });

    } catch (error) {

      console.error(error);

      res.status(400).json({
        message: error.message,
      });

    }

  }
);


router.get(
  "/",
  authenticateToken,
  (req, res) => {

    const purchases =
      db
        .prepare(`
          SELECT
            purchases.*,
            suppliers.name AS supplier_name

          FROM purchases

          LEFT JOIN suppliers
            ON purchases.supplier_id =
               suppliers.id

          ORDER BY
            purchases.id DESC
        `)
        .all();


    res.json(purchases);

  }
);


export default router;