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

    const sales =
      db
        .prepare(`
          SELECT
            COALESCE(
              SUM(total),
              0
            ) AS total_sales

          FROM sales

          WHERE DATE(created_at)
            = DATE('now')
        `)
        .get();


    const orders =
      db
        .prepare(`
          SELECT
            COUNT(*) AS total_orders

          FROM sales

          WHERE DATE(created_at)
            = DATE('now')
        `)
        .get();


    const products =
      db
        .prepare(`
          SELECT
            COUNT(*) AS total_products

          FROM products
        `)
        .get();


    const lowStock =
      db
        .prepare(`
          SELECT
            COUNT(*) AS count

          FROM products

          WHERE stock <= minimum_stock
        `)
        .get();


    const stockValue =
      db
        .prepare(`
          SELECT
            COALESCE(
              SUM(
                stock * purchase_price
              ),
              0
            ) AS value

          FROM products
        `)
        .get();


    const recentSales =
      db
        .prepare(`
          SELECT
            sales.*,
            customers.name
              AS customer_name

          FROM sales

          LEFT JOIN customers
            ON sales.customer_id =
               customers.id

          ORDER BY sales.id DESC

          LIMIT 10
        `)
        .all();


    const lowStockProducts =
      db
        .prepare(`
          SELECT *

          FROM products

          WHERE stock <= minimum_stock

          ORDER BY stock ASC

          LIMIT 10
        `)
        .all();


    res.json({

      totalSales:
        sales.total_sales,

      totalOrders:
        orders.total_orders,

      totalProducts:
        products.total_products,

      lowStock:
        lowStock.count,

      stockValue:
        stockValue.value,

      recentSales,

      lowStockProducts,

    });

  }
);


export default router;