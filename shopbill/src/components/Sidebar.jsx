import React from "react";

import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  FileText,
  Package,
  Tag,
  Receipt,
  RefreshCcw,
  Store,
  Box,
  CircleDollarSign,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  SlidersHorizontal,
  X,
} from "lucide-react";


function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
}) {

  const groups = [
    {
      title: "",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "SALES",
      items: [
        {
          name: "POS",
          icon: ShoppingCart,
        },
      ],
    },

    {
      title: "DELIVERY",
      items: [
        {
          name: "Deliveries",
          icon: Truck,
        },

        {
          name: "Order Planner",
          icon: FileText,
        },

        {
          name: "Delivery Management",
          icon: SlidersHorizontal,
        },
      ],
    },

    {
      title: "INVENTORY",
      items: [
        {
          name: "Products",
          icon: Package,
        },

        {
          name: "Categories",
          icon: Tag,
        },

        {
          name: "Purchase Orders",
          icon: Receipt,
        },

        {
          name: "Stock Adjustment",
          icon: RefreshCcw,
        },

        {
          name: "Warehouses",
          icon: Store,
        },

        {
          name: "Stock Transfers",
          icon: Box,
        },
      ],
    },

    {
      title: "FINANCE",
      items: [
        {
          name: "Expenses",
          icon: CircleDollarSign,
        },

        {
          name: "Cashup",
          icon: CreditCard,
        },

        {
          name: "Reports",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "SYSTEM",
      items: [
        {
          name: "Users",
          icon: Users,
        },

        {
          name: "Roles & Permissions",
          icon: Settings,
        },

        {
          name: "Settings",
          icon: SlidersHorizontal,
        },
      ],
    },
  ];


  return (
    <aside
      className={
        sidebarOpen
          ? "sidebar open"
          : "sidebar"
      }
    >

      {/* Logo */}

      <div className="brand">

        <div className="brand-icon">
          $
        </div>

        <div>
          <div className="brand-name">
            SHOP<span>BILL</span>
          </div>

          <div className="brand-subtitle">
            BILLING • INVENTORY
          </div>
        </div>

        <button
          className="close-sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>

      </div>


      {/* Navigation */}

      <div className="navigation">

        {groups.map((group, index) => (

          <div
            className="nav-group"
            key={index}
          >

            {group.title && (
              <div className="nav-heading">
                {group.title}
              </div>
            )}


            {group.items.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className={
                    activePage === item.name
                      ? "nav-item active"
                      : "nav-item"
                  }

                  onClick={() => {

                    setActivePage(
                      item.name
                    );

                    setSidebarOpen(false);

                  }}
                >

                  <Icon size={14} />

                  <span>
                    {item.name}
                  </span>

                </button>
              );

            })}

          </div>

        ))}

      </div>


      {/* Help */}

      <div className="help-box">

        <div className="help-icon">
          ?
        </div>

        <strong>
          Need help?
        </strong>

        <p>
          Open support center or
          contact us.
        </p>

        <button>
          Contact Support
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;