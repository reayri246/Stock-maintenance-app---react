export const operationsSampleData = {
  "Purchase Orders": {
    columns: ["PO Number", "Supplier", "Items", "Status", "Total", "Expected"],
    rows: [
      ["PO-2026-014", "Aarav Wholesale", "Basmati Rice, Cooking Oil", "Received", "₹ 18,400", "Oct 05"],
      ["PO-2026-015", "Fresh Fields Supply", "Full Cream Milk", "In transit", "₹ 7,200", "Oct 08"],
      ["PO-2026-016", "Daily Needs Distributors", "Biscuits, Bath Soap", "Draft", "₹ 5,640", "Oct 10"],
    ],
  },
  "Stock Adjustment": {
    columns: ["Reference", "Product", "Change", "Reason", "Updated"],
    rows: [
      ["ADJ-0082", "Full Cream Milk 1L", "-2 bottles", "Damaged stock", "Today, 09:42"],
      ["ADJ-0081", "Ruled Notebook", "+5 pcs", "Opening count correction", "Oct 06, 16:10"],
      ["ADJ-0080", "Cooking Oil 1L", "-1 bottle", "Quality check", "Oct 05, 11:25"],
    ],
  },
  Warehouses: {
    columns: ["Warehouse", "Location", "Products", "Manager", "Status"],
    rows: [
      ["Main Store", "Central Market", "126", "Nisha Patel", "Active"],
      ["North Storage", "North Market", "48", "Kabir Shah", "Active"],
      ["Back Room", "Central Market", "19", "Unassigned", "Review needed"],
    ],
  },
  "Stock Transfers": {
    columns: ["Transfer", "From", "To", "Items", "Status"],
    rows: [
      ["TR-0048", "Main Store", "North Storage", "Rice 5kg × 8", "In transit"],
      ["TR-0047", "North Storage", "Main Store", "Notebook × 12", "Completed"],
      ["TR-0046", "Main Store", "Back Room", "Bath Soap × 10", "Pending"],
    ],
  },
  Cashup: {
    columns: ["Register", "Cashier", "Opening", "Expected", "Counted", "Variance"],
    rows: [
      ["Register 1", "Shop Admin", "₹ 2,000", "₹ 8,460", "₹ 8,460", "₹ 0"],
      ["Register 2", "Nisha Patel", "₹ 1,500", "₹ 5,230", "₹ 5,180", "-₹ 50"],
    ],
  },
  Reports: {
    columns: ["Report", "Period", "Sales", "Orders", "Generated"],
    rows: [
      ["Sales summary", "This week", "₹ 42,680", "38", "Today, 08:00"],
      ["Inventory valuation", "Current", "₹ 1,86,240", "126 products", "Today, 08:00"],
      ["Expense summary", "This month", "₹ 21,230", "12 entries", "Oct 06, 18:30"],
    ],
  },
  "Order Planner": {
    columns: ["Plan", "Orders", "Route", "Priority", "Status"],
    rows: [
      ["OP-0024", "ORD-118, ORD-121", "Central Market", "High", "Picking"],
      ["OP-0023", "ORD-115, ORD-117", "North Market", "Normal", "Ready"],
      ["OP-0022", "ORD-109", "West Market", "Normal", "Completed"],
    ],
  },
  Deliveries: {
    columns: ["Delivery", "Customer", "Area", "Courier", "Status", "ETA"],
    rows: [
      ["DLV-0318", "Aarav Stores", "Main Street", "Ravi Kumar", "Out for delivery", "11:30"],
      ["DLV-0317", "Meena Mart", "Lake Road", "Sana Ali", "Preparing", "12:15"],
      ["DLV-0316", "Green Basket", "Park Avenue", "Ravi Kumar", "Delivered", "10:05"],
    ],
  },
  "Delivery Management": {
    columns: ["Route", "Driver", "Stops", "Completed", "Vehicle", "Status"],
    rows: [
      ["Central Market", "Ravi Kumar", "8", "5", "Van 02", "In progress"],
      ["Lake Road", "Sana Ali", "6", "2", "Bike 04", "In progress"],
      ["West Market", "Imran Das", "5", "5", "Van 01", "Completed"],
    ],
  },
  Users: {
    columns: ["Name", "Email", "Role", "Last active", "Status"],
    rows: [
      ["Shop Admin", "admin@shopbill.com", "Administrator", "Today, 09:10", "Active"],
      ["Nisha Patel", "nisha@example.com", "Cashier", "Today, 08:45", "Active"],
      ["Kabir Shah", "kabir@example.com", "Inventory Manager", "Yesterday", "Active"],
    ],
  },
  "Roles & Permissions": {
    columns: ["Role", "Users", "Permissions", "Scope"],
    rows: [
      ["Administrator", "1", "All modules", "Full access"],
      ["Cashier", "2", "POS, customers, cashup", "Store"],
      ["Inventory Manager", "1", "Products, purchasing, transfers", "Store"],
    ],
  },
  Settings: {
    columns: ["Setting", "Value", "Status"],
    rows: [
      ["Store name", "ShopBill Demo Store", "Configured"],
      ["Currency", "INR (₹)", "Configured"],
      ["Low-stock alert threshold", "Product minimum quantity", "Enabled"],
    ],
  },
};
