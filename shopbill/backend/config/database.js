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

const seedSampleData = db.transaction(() => {
  const categoryNames = [
    ["Grocery", "Everyday grocery items"],
    ["Dairy", "Milk and chilled products"],
    ["Snacks", "Packaged snacks and biscuits"],
    ["Personal Care", "Personal care essentials"],
  ];
  const getCategory = db.prepare("SELECT id FROM categories WHERE name = ?");
  const addCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name, description, status) VALUES (?, ?, 'active')"
  );

  for (const [name, description] of categoryNames) {
    addCategory.run(name, description);
  }

  const categories = Object.fromEntries(
    [...categoryNames.map(([name]) => name), "Stationery"].map((name) => [
      name,
      getCategory.get(name).id,
    ])
  );

  const supplierRows = [
    ["Aarav Wholesale", "aarav.wholesale@example.com", "9876501001", "Central Market"],
    ["Fresh Fields Supply", "fresh.fields@example.com", "9876501002", "North Market"],
    ["Daily Needs Distributors", "daily.needs@example.com", "9876501003", "West Market"],
  ];
  const getSupplier = db.prepare("SELECT id FROM suppliers WHERE email = ?");
  const addSupplier = db.prepare(
    "INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)"
  );

  for (const [name, email, phone, address] of supplierRows) {
    if (!getSupplier.get(email)) addSupplier.run(name, phone, email, address);
  }

  const suppliers = Object.fromEntries(
    supplierRows.map(([, email]) => [email, getSupplier.get(email).id])
  );

  const customerRows = [
    ["Aarav Stores", "9876502001", "aarav.stores@example.com", "Main Street"],
    ["Meena Mart", "9876502002", "meena.mart@example.com", "Lake Road"],
    ["Raza Wholesale", "9876502003", "raza.wholesale@example.com", "Market Road"],
    ["Green Basket", "9876502004", "green.basket@example.com", "Park Avenue"],
    ["Sree Traders", "9876502005", "sree.traders@example.com", "Station Road"],
  ];
  const getCustomer = db.prepare("SELECT id FROM customers WHERE email = ?");
  const addCustomer = db.prepare(
    "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)"
  );

  for (const [name, phone, email, address] of customerRows) {
    if (!getCustomer.get(email)) addCustomer.run(name, phone, email, address);
  }

  const customers = Object.fromEntries(
    customerRows.map(([, , email]) => [email, getCustomer.get(email).id])
  );

  const productRows = [
    ["Full Cream Milk 1L", "DEMO-MILK-1L", "Dairy", supplierRows[1][1], 28, 36, 4, 8, "bottle", 5],
    ["Basmati Rice 5kg", "DEMO-RICE-5KG", "Grocery", supplierRows[0][1], 260, 320, 24, 8, "bag", 5],
    ["Cooking Oil 1L", "DEMO-OIL-1L", "Grocery", supplierRows[0][1], 130, 160, 5, 8, "bottle", 5],
    ["Assorted Biscuits", "DEMO-BISCUIT", "Snacks", supplierRows[2][1], 18, 25, 7, 10, "pack", 5],
    ["Bath Soap 100g", "DEMO-SOAP-100G", "Personal Care", supplierRows[2][1], 28, 40, 28, 10, "bar", 5],
    ["Ruled Notebook", "DEMO-NOTEBOOK", "Stationery", supplierRows[0][1], 32, 55, 42, 12, "pcs", 5],
  ];
  const getProduct = db.prepare("SELECT id FROM products WHERE sku = ?");
  const addProduct = db.prepare(`
    INSERT INTO products
      (name, sku, category_id, supplier_id, description, status, purchase_price, selling_price, stock, minimum_stock, unit, tax)
    VALUES (?, ?, ?, ?, 'Sample inventory item', 'active', ?, ?, ?, ?, ?, ?)
  `);

  for (const [name, sku, category, supplierEmail, cost, price, stock, minimum, unit, tax] of productRows) {
    if (!getProduct.get(sku)) {
      addProduct.run(name, sku, categories[category], suppliers[supplierEmail], cost, price, stock, minimum, unit, tax);
    }
  }

  const saleRows = [
    ["DEMO-1001", customerRows[0][2], "cash", 6, [["DEMO-RICE-5KG", 2], ["DEMO-OIL-1L", 1]]],
    ["DEMO-1002", customerRows[1][2], "upi", 4, [["DEMO-MILK-1L", 3], ["DEMO-BISCUIT", 4]]],
    ["DEMO-1003", customerRows[2][2], "card", 2, [["DEMO-RICE-5KG", 1], ["DEMO-SOAP-100G", 5]]],
    ["DEMO-1004", customerRows[3][2], "upi", 1, [["DEMO-OIL-1L", 2], ["DEMO-BISCUIT", 3]]],
    ["DEMO-1005", customerRows[4][2], "cash", 0, [["DEMO-NOTEBOOK", 6], ["DEMO-SOAP-100G", 2]]],
  ];
  const getSale = db.prepare("SELECT id FROM sales WHERE invoice_number = ?");
  const addSale = db.prepare(`
    INSERT INTO sales (invoice_number, customer_id, subtotal, total, payment_method, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', ?))
  `);
  const getProductDetails = db.prepare("SELECT id, selling_price FROM products WHERE sku = ?");
  const addSaleItem = db.prepare(
    "INSERT INTO sale_items (sale_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)"
  );

  for (const [invoice, customerEmail, payment, daysAgo, items] of saleRows) {
    if (getSale.get(invoice)) continue;

    const saleItems = items.map(([sku, quantity]) => {
      const product = getProductDetails.get(sku);
      return { ...product, quantity, total: product.selling_price * quantity };
    });
    const total = saleItems.reduce((sum, item) => sum + item.total, 0);
    const sale = addSale.run(invoice, customers[customerEmail], total, total, payment, `-${daysAgo} days`);

    for (const item of saleItems) {
      addSaleItem.run(sale.lastInsertRowid, item.id, item.quantity, item.selling_price, item.total);
    }
  }

  const expenseRows = [
    ["Shop rent", 18000, "Rent", "Demo record: monthly shop rent"],
    ["Electricity bill", 2450, "Utilities", "Demo record: monthly electricity"],
    ["Local delivery", 780, "Transport", "Demo record: local delivery costs"],
  ];
  const getExpense = db.prepare("SELECT id FROM expenses WHERE title = ? AND description = ?");
  const addExpense = db.prepare(
    "INSERT INTO expenses (title, amount, category, description) VALUES (?, ?, ?, ?)"
  );

  for (const expense of expenseRows) {
    if (!getExpense.get(expense[0], expense[3])) addExpense.run(...expense);
  }
});

seedSampleData();

console.log("Database initialized");

export default db;