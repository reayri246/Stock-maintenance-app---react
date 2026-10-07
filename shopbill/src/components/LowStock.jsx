function LowStock({ products }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">LOW STOCK ALERT</span>
          <h3>Needs attention</h3>
        </div>
        <span className="stock-count">{products.length} Items</span>
      </div>
      <div className="stock-list">
        {products.map((product) => {
          const stock = Number(product.stock || 0);
          const minimum = Number(product.minimum_stock || 0);
          const level = stock <= minimum / 2 ? "critical" : "warning";

          return (
            <div className="stock-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <small>{product.category_name || "Uncategorized"}</small>
              </div>
              <div className="stock-number">
                <b className={`stock-${level}`}>{stock}</b>
                <small>/ min {minimum}</small>
              </div>
            </div>
          );
        })}
        {!products.length ? <p>No low-stock items right now.</p> : null}
      </div>
      <button className="view-link">View All Low Stock →</button>
    </section>
  );
}

export default LowStock;