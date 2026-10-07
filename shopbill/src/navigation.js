export const PAGE_PATHS = {
  Dashboard: "/",
  POS: "/pos",
  "Create Bill": "/create-bill",
  Bills: "/bills",
  Deliveries: "/coming-soon/deliveries",
  "Order Planner": "/coming-soon/order-planner",
  "Delivery Management": "/coming-soon/delivery-management",
  Products: "/products",
  Categories: "/categories",
  "Purchase Orders": "/coming-soon/purchase-orders",
  "Stock Adjustment": "/coming-soon/stock-adjustment",
  Warehouses: "/coming-soon/warehouses",
  "Stock Transfers": "/coming-soon/stock-transfers",
  Expenses: "/expenses",
  Cashup: "/coming-soon/cashup",
  Reports: "/coming-soon/reports",
  Users: "/coming-soon/users",
  "Roles & Permissions": "/coming-soon/roles-permissions",
  Settings: "/coming-soon/settings",
};

export function getPageName(pathname) {
  return Object.entries(PAGE_PATHS).find(([, path]) => path === pathname)?.[0] ?? "Dashboard";
}