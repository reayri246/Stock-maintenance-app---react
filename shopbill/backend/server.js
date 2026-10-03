import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import "./config/database.js";

import authRoutes
  from "./routes/authRoutes.js";

import productRoutes
  from "./routes/productRoutes.js";

import customerRoutes
  from "./routes/customerRoutes.js";

import categoryRoutes
  from "./routes/categoryRoutes.js";

import supplierRoutes
  from "./routes/supplierRoutes.js";

import salesRoutes
  from "./routes/salesRoutes.js";

import purchaseRoutes
  from "./routes/purchaseRoutes.js";

import expenseRoutes
  from "./routes/expenseRoutes.js";

import dashboardRoutes
  from "./routes/dashboardRoutes.js";


dotenv.config();


const app = express();

const PORT =
  process.env.PORT || 5000;


/*
  Middleware
*/

app.use(
  cors({
    origin:
      "http://localhost:5173",
  })
);

app.use(
  express.json()
);


/*
  Health Check
*/

app.get(
  "/",
  (req, res) => {

    res.json({
      status: "ok",

      message:
        "ShopBill backend is running",
    });

  }
);


/*
  API Routes
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/suppliers",
  supplierRoutes
);

app.use(
  "/api/sales",
  salesRoutes
);

app.use(
  "/api/purchases",
  purchaseRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);


/*
  404
*/

app.use(
  (req, res) => {

    res.status(404).json({
      message: "API route not found",
    });

  }
);


/*
  Error Handler
*/

app.use(
  (error, req, res, next) => {

    console.error(error);

    res.status(500).json({
      message:
        "Internal server error",
    });

  }
);


/*
  Start Server
*/

app.listen(
  PORT,
  () => {

    console.log(
      `ShopBill backend running at http://localhost:${PORT}`
    );

  }
);