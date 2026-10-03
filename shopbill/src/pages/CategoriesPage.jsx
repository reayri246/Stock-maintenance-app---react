import React, { useEffect, useMemo, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/categories";

const emptyForm = { name: "", description: "", status: "active" };

function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setItems(response || []);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return items;

    return items.filter((item) =>
      [item.name, item.description].join(" ").toLowerCase().includes(value)
    );
  }, [items, search]);

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
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      status: item.status || "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      await fetchData();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Categories</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Organize products and inventory</p>
        </div>
        <button className="primary-button" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          Add Category
        </button>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search category" />
      </div>

      {error ? <div className="form-error" style={{ marginTop: 12 }}>{error}</div> : null}

      {showForm ? (
        <div className="panel" style={{ marginTop: 16, padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Category" : "Add Category"}</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Category Name" required />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ minHeight: 80, gridColumn: "1 / -1" }} />

            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
              <button type="submit" className="primary-button">{editingId ? "Save" : "Add Category"}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        {loading ? (
          <p>Loading categories...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>No categories found</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description || "-"}</td>
                    <td>
                      <span className={`status-pill ${item.status === "active" ? "green" : "yellow"}`}>
                        {item.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{Number(item.product_count || 0)}</td>
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

export default CategoriesPage;
