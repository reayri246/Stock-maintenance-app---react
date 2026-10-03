import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseFolder = path.join(__dirname, "..", "database");

if (!fs.existsSync(databaseFolder)) {
  fs.mkdirSync(databaseFolder, {
    recursive: true,
  });
}

const dbPath = path.join(
  databaseFolder,
  "shopbill.db"
);

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  sku TEXT UNIQUE NOT NULL,

  barcode TEXT UNIQUE,

  category_id INTEGER,
  supplier_id INTEGER,
  description TEXT,
  status TEXT DEFAULT 'active',

  purchase_price REAL DEFAULT 0,

  selling_price REAL DEFAULT 0,

  stock INTEGER DEFAULT 0,

  minimum_stock INTEGER DEFAULT 5,

  unit TEXT DEFAULT 'pcs',

  tax REAL DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id)
    REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  phone TEXT,

  email TEXT,

  address TEXT,

  credit_balance REAL DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  phone TEXT,

  email TEXT,

  address TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  invoice_number TEXT UNIQUE NOT NULL,

  customer_id INTEGER,

  subtotal REAL DEFAULT 0,

  tax REAL DEFAULT 0,

  discount REAL DEFAULT 0,

  total REAL DEFAULT 0,

  payment_method TEXT DEFAULT 'cash',

  payment_status TEXT DEFAULT 'paid',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id)
    REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  sale_id INTEGER NOT NULL,

  product_id INTEGER NOT NULL,

  quantity INTEGER NOT NULL,

  price REAL NOT NULL,

  total REAL NOT NULL,

  FOREIGN KEY (sale_id)
    REFERENCES sales(id)
    ON DELETE CASCADE,

  FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  purchase_number TEXT UNIQUE NOT NULL,

  supplier_id INTEGER,

  subtotal REAL DEFAULT 0,

  tax REAL DEFAULT 0,

  discount REAL DEFAULT 0,

  total REAL DEFAULT 0,

  payment_status TEXT DEFAULT 'paid',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  purchase_id INTEGER NOT NULL,

  product_id INTEGER NOT NULL,

  quantity INTEGER NOT NULL,

  price REAL NOT NULL,

  total REAL NOT NULL,

  FOREIGN KEY (purchase_id)
    REFERENCES purchases(id)
    ON DELETE CASCADE,

  FOREIGN KEY (product_id)
    REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  title TEXT NOT NULL,

  amount REAL NOT NULL,

  category TEXT,

  description TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

`);

const ensureColumn = (tableName, columnName, columnDefinition) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((col) => col.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
};

ensureColumn("categories", "description", "TEXT");
ensureColumn("categories", "status", "TEXT DEFAULT 'active'");
ensureColumn("products", "supplier_id", "INTEGER");
ensureColumn("products", "description", "TEXT");
ensureColumn("products", "status", "TEXT DEFAULT 'active'");

const defaultAdmin = db
  .prepare("SELECT * FROM users WHERE email = ?")
  .get("admin@shopbill.com");

const adminPasswordHash = bcrypt.hashSync("admin123", 10);

if (!defaultAdmin) {
  db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  ).run(
    "Shop Admin",
    "admin@shopbill.com",
    adminPasswordHash,
    "admin"
  );
} else if (!bcrypt.compareSync("admin123", defaultAdmin.password)) {
  db.prepare("UPDATE users SET password = ? WHERE email = ?").run(adminPasswordHash, "admin@shopbill.com");
}

const categoryCount = db.prepare("SELECT COUNT(*) AS count FROM categories").get().count;
if (categoryCount === 0) {
  const defaultCategories = [
    ["Electronics", "Electronic products", "active"],
    ["Stationery", "Office and school supplies", "active"],
    ["Hardware", "Tools and hardware items", "active"],
  ];

  const insertCategory = db.prepare(
    "INSERT INTO categories (name, description, status) VALUES (?, ?, ?)"
  );

  defaultCategories.forEach(([name, description, status]) => {
    insertCategory.run(name, description, status);
  });
}

const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get().count;
if (productCount === 0) {
  const categoryId = db.prepare("SELECT id FROM categories ORDER BY id LIMIT 1").get()?.id ?? 1;
  db.prepare(
    `INSERT INTO products (name, sku, barcode, category_id, supplier_id, description, status, purchase_price, selling_price, stock, minimum_stock, unit, tax)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    "Basic Notebook",
    "NB-001",
    "8901234567890",
    categoryId,
    null,
    "Premium notebook for daily use",
    "active",
    40,
    90,
    25,
    10,
    "pcs",
    5
  );
}

console.log("Database initialized");

export default db;