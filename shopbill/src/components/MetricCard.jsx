import React from "react";

import {
  CircleDollarSign,
  Package,
  BarChart3,
} from "lucide-react";


function MetricCard({
  title,
  value,
  description,
  type,
  chart = false,
}) {

  const icons = {
    green: CircleDollarSign,
    purple: Package,
    blue: BarChart3,
  };

  const Icon = icons[type];


  return (
    <div className="metric-card">

      <div className="metric-header">

        <div
          className={`metric-icon ${type}`}
        >
          <Icon size={16} />
        </div>

        <span>
          {title}
        </span>

      </div>


      {chart ? (

        <>
          <div className="performance-value">
            {value}
          </div>

          <div className="performance-chart">

            <svg
              viewBox="0 0 300 90"
              preserveAspectRatio="none"
            >

              <polyline
                points="
                0,70
                25,55
                45,65
                70,48
                95,58
                120,52
                145,65
                170,47
                195,55
                220,38
                245,45
                265,20
                285,30
                300,12
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />

            </svg>

          </div>

          <p className="metric-description">
            ↑ Sales up <strong>53%</strong>
            over the period
          </p>
        </>

      ) : (

        <>
          <div className="metric-value">
            {value}
          </div>

          <p className="metric-description">
            {description}
          </p>
        </>

      )}

    </div>
  );
}

export default MetricCard;