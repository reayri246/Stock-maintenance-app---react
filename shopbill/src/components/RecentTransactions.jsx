function RecentTransactions({ sales }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">RECENT TRANSACTIONS</span>
          <h3>Latest bills</h3>
        </div>
        <button className="filter-button">Recent</button>
      </div>
      <div className="transactions">
        {sales.map((transaction) => (
          <div className="transaction" key={transaction.id}>
            <div className="transaction-icon">₹</div>
            <div className="transaction-info">
              <strong>#{transaction.invoice_number}</strong>
              <small>
                {transaction.customer_name || "Walk-in customer"}
                {" • "}
                {transaction.payment_method}
              </small>
            </div>
            <strong>₹ {Number(transaction.total || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
          </div>
        ))}
        {!sales.length ? <p>No transactions yet.</p> : null}
      </div>
      <button className="view-link">View All Transactions →</button>
    </section>
  );
}

export default RecentTransactions;