import React from "react";

import {
  CircleDollarSign,
  Receipt,
  Package,
  Box,
} from "lucide-react";


function FooterStats() {

  const stats = [
    {
      value: "₹ 19,457.42",
      label: "Total Cash",
      type: "green",
      icon: CircleDollarSign,
    },

    {
      value: "77",
      label: "Total Transactions",
      type: "blue",
      icon: Receipt,
    },

    {
      value: "₹ 241.83",
      label: "Avg. Order Value",
      type: "purple",
      icon: CircleDollarSign,
    },

    {
      value: "2459.73",
      label: "Items Sold",
      type: "orange",
      icon: Package,
    },

    {
      value: "96",
      label: "Unique Products",
      type: "cyan",
      icon: Box,
    },

    {
      value: "₹ 23,222.92",
      label: "Total Invoices",
      type: "blue",
      icon: Receipt,
    },
  ];


  return (
    <div className="footer-stats">

      {stats.map((stat) => {

        const Icon = stat.icon;

        return (
          <div
            className="footer-stat"
            key={stat.label}
          >

            <div
              className={`footer-icon ${stat.type}`}
            >
              <Icon size={14} />
            </div>

            <strong>
              {stat.value}
            </strong>

            <small>
              {stat.label}
            </small>

          </div>
        );

      })}

    </div>
  );
}

export default FooterStats;