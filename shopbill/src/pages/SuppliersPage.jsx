import React, { useEffect, useMemo, useState } from "react";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gst_number: "",
  contact_person: "",
};

function SuppliersPage() {
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
      const response = await fetch("http://localhost:5000/api/suppliers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load suppliers");
      setItems(data || []);
    } catch (err) {
      setError(err.message || "Failed to load suppliers");
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
      [item.name, item.phone, item.email, item.address, item.gst_number, item.contact_person].join(" ").toLowerCase().includes(value)
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
      const response = await fetch(`http://localhost:5000/api/suppliers${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Supplier save failed");

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
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      gst_number: item.gst_number || "",
      contact_person: item.contact_person || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
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
          <h2 style={{ margin: 0 }}>Suppliers</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Manage vendor details and purchases</p>
        </div>
        <button className="primary-button" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          Add Supplier
        </button>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier" />
      </div>

      {error ? <div className="form-error" style={{ marginTop: 12 }}>{error}</div> : null}

      {showForm ? (
        <div className="panel" style={{ marginTop: 16, padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Supplier" : "Add Supplier"}</h3>
          <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Supplier Name" required />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="gst_number" value={form.gst_number} onChange={handleChange} placeholder="GST/Tax Number" />
            <input name="contact_person" value={form.contact_person} onChange={handleChange} placeholder="Contact Person" />
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" style={{ minHeight: 80, gridColumn: "1 / -1" }} />

            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
              <button type="submit" className="primary-button">{editingId ? "Save" : "Add Supplier"}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>GST</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#9ca3af" }}>No suppliers found</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.phone || "-"}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.gst_number || "-"}</td>
                    <td>{item.contact_person || "-"}</td>
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

export default SuppliersPage;
