import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/dashboard";
import MetricCard from "../components/MetricCard";
import QuickActions from "../components/QuickActions";
import SalesOverview from "../components/SalesOverview";
import LowStock from "../components/LowStock";
import RecentTransactions from "../components/RecentTransactions";
import FooterStats from "../components/FooterStats";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStock: 0,
    stockValue: 0,
    recentSales: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setStats(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <section className="dashboard">
      <div className="date-filter">
        {[
          "Today",
          "Yesterday",
          "This Week",
          "This Month",
          "7 Days",
          "30 Days",
        ].map((period, index) => (
          <button
            key={period}
            className={index === 5 ? "date-button active" : "date-button"}
          >
            {period}
          </button>
        ))}
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      {loading ? (
        <div className="section" style={{ padding: "1rem 0" }}>
          <div className="panel" style={{ padding: "1.5rem" }}>Loading dashboard...</div>
        </div>
      ) : (
        <>
          <div className="metrics">
            <MetricCard
              title="SALES ACTIVITY"
              value={`₹ ${Number(stats.totalSales || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
              description="Live sales summary"
              type="green"
            />
            <MetricCard
              title="TOTAL PRODUCTS"
              value={String(stats.totalProducts || 0)}
              description="Available catalog items"
              type="purple"
            />
            <MetricCard
              title="LOW STOCK ALERTS"
              value={String(stats.lowStock || 0)}
              description="Products requiring attention"
              type="blue"
              chart
            />
          </div>

          <section className="section">
            <div className="section-title">QUICK ACCESS</div>
            <QuickActions />
          </section>

          <div className="dashboard-grid">
            <SalesOverview />
            <LowStock />
            <RecentTransactions />
          </div>

          <FooterStats />
        </>
      )}
    </section>
  );
}

export default DashboardPage;
