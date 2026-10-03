import React from "react";

import {
  ShoppingCart,
  Receipt,
  Package,
  Box,
  CircleDollarSign,
  BarChart3,
} from "lucide-react";


function QuickActions() {

  const actions = [
    {
      name: "Open POS",
      icon: ShoppingCart,
      type: "green",
    },

    {
      name: "Sales",
      icon: Receipt,
      type: "blue",
    },

    {
      name: "Products",
      icon: Package,
      type: "purple",
    },

    {
      name: "Inventory",
      icon: Box,
      type: "orange",
    },

    {
      name: "Cashup",
      icon: CircleDollarSign,
      type: "cyan",
    },

    {
      name: "Reports",
      icon: BarChart3,
      type: "gray",
    },
  ];


  return (
    <div className="quick-actions">

      {actions.map((action) => {

        const Icon = action.icon;

        return (
          <button
            key={action.name}
            className={`quick-button ${action.type}`}
          >

            <Icon size={16} />

            <span>
              {action.name}
            </span>

          </button>
        );

      })}

    </div>
  );
}

export default QuickActions;