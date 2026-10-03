import React from "react";

import {
  lowStockProducts,
} from "../data/dashboardData";


function LowStock() {

  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <span className="panel-label">
            LOW STOCK ALERT
          </span>

          <h3>
            Needs attention
          </h3>

        </div>

        <span className="stock-count">
          7 Items
        </span>

      </div>


      <div className="stock-list">

        {lowStockProducts.map(
          (product) => (

            <div
              className="stock-row"
              key={product.name}
            >

              <div>

                <strong>
                  {product.name}
                </strong>

                <small>
                  {product.category}
                </small>

              </div>


              <div className="stock-number">

                <b
                  className={
                    `stock-${product.level}`
                  }
                >
                  {product.stock}
                </b>

                <small>
                  / min {product.minimum}
                </small>

              </div>

            </div>

          )
        )}

      </div>


      <button className="view-link">
        View All Low Stock →
      </button>

    </section>
  );
}

export default LowStock;