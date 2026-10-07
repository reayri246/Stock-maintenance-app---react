import { SlidersHorizontal } from "lucide-react";

function SalesOverview({ salesByDay }) {
  const totalSales = salesByDay.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const totalOrders = salesByDay.reduce((sum, item) => sum + Number(item.orders || 0), 0);
  const maxSales = Math.max(...salesByDay.map((item) => Number(item.value || 0)), 1);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">SALES OVERVIEW</span>
          <div className="sales-summary">
            <strong>₹ {totalSales.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
            <span>{totalOrders} Total Orders</span>
            <em>₹ {(totalOrders ? totalSales / totalOrders : 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Avg. Order</em>
          </div>
        </div>
        <button className="filter-button">
          <SlidersHorizontal size={12} />
          Last 7 Days
        </button>
      </div>
      <div className="sales-bars">
        {salesByDay.map((item) => (
          <div className="sales-row" key={item.day}>
            <span>{new Date(`${item.day}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</span>
            <div className="bar-background">
              <div className="bar" style={{ width: `${(Number(item.value || 0) / maxSales) * 100}%` }} />
            </div>
            <strong>₹ {Number(item.value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
          </div>
        ))}
        {!salesByDay.length ? <p>No sales in the last 7 days.</p> : null}
      </div>
    </section>
  );
}

export default SalesOverview;