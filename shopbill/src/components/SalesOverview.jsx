import React from "react";

import { SlidersHorizontal } from "lucide-react";

import {
  salesData,
} from "../data/dashboardData";


function SalesOverview() {

  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <span className="panel-label">
            SALES OVERVIEW
          </span>

          <div className="sales-summary">

            <strong>
              ₹ 16,022.40
            </strong>

            <span>
              74 Total Orders
            </span>

            <em>
              ₹ 224.63 Avg. Order
            </em>

          </div>

        </div>


        <button className="filter-button">

          <SlidersHorizontal size={12} />

          Last 7 Days

        </button>

      </div>


      <div className="sales-bars">

        {salesData.map((item) => (

          <div
            className="sales-row"
            key={item.day}
          >

            <span>
              {item.day}
            </span>

            <div className="bar-background">

              <div
                className="bar"
                style={{
                  width: `${item.value / 4.6}%`,
                }}
              />

            </div>

            <strong>
              ₹ {item.value * 5}
            </strong>

          </div>

        ))}

      </div>

    </section>
  );
}

export default SalesOverview;