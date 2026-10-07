import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import ExpensesPage from "./pages/ExpensesPage";
import PosPage from "./pages/PosPage";
import CreateBillPage from "./pages/CreateBillPage";
import BillsPage from "./pages/BillsPage";
import { getPageName } from "./navigation";
import { operationsSampleData } from "./data/operationsSampleData";

function ComingSoonPage({ pageName }) {
  const sample = operationsSampleData[pageName];

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>{pageName}</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Sample records for preview</p>
        </div>
        <span className="stock-count">{sample?.rows.length || 0} records</span>
      </div>
      <div className="panel" style={{ overflowX: "auto", padding: "1rem" }}>
        <table className="data-table">
          <thead>
            <tr>
              {sample?.columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {sample?.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((value, index) => <td key={`${row[0]}-${index}`}>{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const activePage = getPageName(pathname);

  if (!localStorage.getItem("shopbill_token")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main">
        <Topbar setSidebarOpen={setSidebarOpen} activePage={activePage} />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/bills/new" element={<CreateBillPage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/coming-soon/:feature" element={<ComingSoonPage pageName={activePage} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;