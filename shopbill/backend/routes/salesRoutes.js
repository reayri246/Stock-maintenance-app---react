import express from "express";

import db from "../config/database.js";

import {
  authenticateToken,
} from "../middleware/authMiddleware.js";

import {
  generateInvoiceNumber,
} from "../utils/invoiceNumber.js";

const router = express.Router();


/*
  CREATE SALE
*/

router.post(
  "/",
  authenticateToken,
  (req, res) => {

    try {

      const {
        customer_id,
        discount = 0,
        payment_method = "cash",
        items,
      } = req.body;


      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({
          message:
            "At least one product is required",
        });

      }


      const createSale =
        db.transaction(() => {

          let subtotal = 0;

          const processedItems = [];


          /*
            Validate products
          */

          for (const item of items) {

            const product =
              db
                .prepare(
                  `
                  SELECT *
                  FROM products
                  WHERE id = ?
                  `
                )
                .get(item.product_id);


            if (!product) {

              throw new Error(
                `Product ${item.product_id} not found`
              );

            }


            if (
              product.stock <
              item.quantity
            ) {

              throw new Error(
                `${product.name} has only ${product.stock} items available`
              );

            }


            const price =
              Number(
                item.price ??
                product.selling_price
              );


            const quantity =
              Number(item.quantity);


            const total =
              price * quantity;


            subtotal += total;


            processedItems.push({
              product,
              price,
              quantity,
              total,
            });

          }


          const tax = 0;

          const total =
            subtotal -
            Number(discount) +
            tax;


          const invoiceNumber =
            generateInvoiceNumber();


          /*
            Insert sale
          */

          const sale =
            db
              .prepare(`
                INSERT INTO sales
                (
                  invoice_number,
                  customer_id,
                  subtotal,
                  tax,
                  discount,
                  total,
                  payment_method
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
              `)
              .run(
                invoiceNumber,
                customer_id || null,
                subtotal,
                tax,
                discount,
                total,
                payment_method
              );


          const saleId =
            sale.lastInsertRowid;


          /*
            Insert items
            + Reduce stock
          */

          const insertItem =
            db.prepare(`
              INSERT INTO sale_items
              (
                sale_id,
                product_id,
                quantity,
                price,
                total
              )

              VALUES (?, ?, ?, ?, ?)
            `);


          const reduceStock =
            db.prepare(`
              UPDATE products

              SET
                stock = stock - ?,
                updated_at =
                  CURRENT_TIMESTAMP

              WHERE id = ?
            `);


          for (
            const item of processedItems
          ) {

            insertItem.run(
              saleId,
              item.product.id,
              item.quantity,
              item.price,
              item.total
            );


            reduceStock.run(
              item.quantity,
              item.product.id
            );

          }


          return {
            saleId,
            invoiceNumber,
            subtotal,
            discount,
            tax,
            total,
            payment_method,
          };

        });


      const result =
        createSale();


      res.status(201).json({
        message: "Sale completed successfully",

        sale: result,
      });

    } catch (error) {

      console.error(error);

      res.status(400).json({
        message: error.message,
      });

    }

  }
);


/*
  GET ALL SALES
*/

router.get(
  "/",
  authenticateToken,
  (req, res) => {

    const sales = db
      .prepare(`
        SELECT
          sales.*,
          customers.name AS customer_name

        FROM sales

        LEFT JOIN customers
          ON sales.customer_id =
             customers.id

        ORDER BY
          sales.id DESC
      `)
      .all();


    res.json(sales);

  }
);


/*
  GET SINGLE SALE
*/

router.get(
  "/:id",
  authenticateToken,
  (req, res) => {

    const sale = db
      .prepare(`
        SELECT
          sales.*,
          customers.name AS customer_name

        FROM sales

        LEFT JOIN customers
          ON sales.customer_id =
             customers.id

        WHERE sales.id = ?
      `)
      .get(req.params.id);


    if (!sale) {

      return res.status(404).json({
        message: "Sale not found",
      });

    }


    const items = db
      .prepare(`
        SELECT
          sale_items.*,
          products.name AS product_name,
          products.sku

        FROM sale_items

        JOIN products
          ON sale_items.product_id =
             products.id

        WHERE sale_items.sale_id = ?
      `)
      .all(req.params.id);


    res.json({
      ...sale,
      items,
    });

  }
);


export default router;