import React from "react";

import {
  transactions,
} from "../data/dashboardData";


function RecentTransactions() {

  return (
    <section className="panel">

      <div className="panel-header">

        <div>

          <span className="panel-label">
            RECENT TRANSACTIONS
          </span>

          <h3>
            Latest bills
          </h3>

        </div>

        <button className="filter-button">
          Today
        </button>

      </div>


      <div className="transactions">

        {transactions.map(
          (transaction) => (

            <div
              className="transaction"
              key={transaction.invoice}
            >

              <div className="transaction-icon">
                ₹
              </div>


              <div className="transaction-info">

                <strong>
                  {transaction.invoice}
                </strong>

                <small>
                  {transaction.customer}
                  {" • "}
                  {transaction.payment}
                </small>

              </div>


              <strong>
                {transaction.amount}
              </strong>

            </div>

          )
        )}

      </div>


      <button className="view-link">
        View All Transactions →
      </button>

    </section>
  );
}

export default RecentTransactions;