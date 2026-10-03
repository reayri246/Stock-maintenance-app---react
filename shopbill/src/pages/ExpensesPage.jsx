import React, { useEffect, useMemo, useState } from "react";

const emptyForm = { title: "", amount: "", category: "rent", description: "" };

function ExpensesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("shopbill_token")}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load expenses");
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !value || `${item.title} ${item.category || ""} ${item.description || ""}`.toLowerCase().includes(value);
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, filterCategory]);

  const total = filteredItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount || 0),
      };

      const response = await fetch(`http://localhost:5000/api/expenses${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Expense save failed");

      resetForm();
      await fetchData();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      amount: String(item.amount || 0),
      category: item.category || "rent",
      description: item.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("shopbill_token")}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      await fetchData();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Expenses</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Track operational spending</p>
        </div>
        <button className="primary-button" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          Add Expense
        </button>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <div className="toolbar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses" />
          <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="all">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="salary">Salary</option>
            <option value="transport">Transport</option>
            <option value="maintenance">Maintenance</option>
            <option value="internet">Internet</option>
            <option value="other">Other</option>
          </select>
          <div style={{ fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Total: ₹{total.toFixed(2)}
          </div>
        </div>
      </div>

      {error ? <div className="form-error" style={{ marginTop: 12 }}>{error}</div> : null}

      {showForm ? (
        <div className="panel" style={{ marginTop: 16, padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Expense" : "Add Expense"}</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Expense Title" required />
            <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount" required />
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="salary">Salary</option>
              <option value="transport">Transport</option>
              <option value="maintenance">Maintenance</option>
              <option value="internet">Internet</option>
              <option value="other">Other</option>
            </select>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ minHeight: 80, gridColumn: "1 / -1" }} />

            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
              <button type="submit" className="primary-button">{editingId ? "Save" : "Add Expense"}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        {loading ? (
          <p>Loading expenses...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>No expenses found</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>₹{Number(item.amount || 0).toFixed(2)}</td>
                    <td>{item.category || "Other"}</td>
                    <td>{item.description || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="table-button" onClick={() => handleEdit(item)}>Edit</button>
                        <button type="button" className="table-button danger" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default ExpensesPage;
