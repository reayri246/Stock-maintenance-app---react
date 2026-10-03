import React, { useEffect, useMemo, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/products";
import { getCategories } from "../api/categories";

const emptyForm = {
  name: "",
  sku: "",
  barcode: "",
  category_id: "",
  supplier_id: "",
  purchase_price: "",
  selling_price: "",
  stock: "",
  minimum_stock: "",
  unit: "pcs",
  tax: "",
  description: "",
  status: "active",
};

function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setItems(productsResponse || []);
      setCategories(categoriesResponse || []);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      const matchesSearch =
        !search ||
        `${item.name} ${item.sku} ${item.barcode || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || String(item.category_id) === String(filterCategory);
      const matchesStatus =
        filterStatus === "all" || getStockStatus(item) === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, filterCategory, filterStatus]);

  const getStockStatus = (item) => {
    if (item.stock <= 0) return "red";
    if (item.stock <= Number(item.minimum_stock || 0)) return "yellow";
    return "green";
  };

  const getStatusLabel = (status) => {
    if (status === "green") return "In Stock";
    if (status === "yellow") return "Low Stock";
    return "Out of Stock";
  };

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
        purchase_price: Number(form.purchase_price || 0),
        selling_price: Number(form.selling_price || 0),
        stock: Number(form.stock || 0),
        minimum_stock: Number(form.minimum_stock || 0),
        tax: Number(form.tax || 0),
        category_id: form.category_id ? Number(form.category_id) : null,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
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
      sku: item.sku || "",
      barcode: item.barcode || "",
      category_id: item.category_id ? String(item.category_id) : "",
      supplier_id: item.supplier_id ? String(item.supplier_id) : "",
      purchase_price: String(item.purchase_price || 0),
      selling_price: String(item.selling_price || 0),
      stock: String(item.stock || 0),
      minimum_stock: String(item.minimum_stock || 0),
      unit: item.unit || "pcs",
      tax: String(item.tax || 0),
      description: item.description || "",
      status: item.status || "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      await fetchData();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Manage inventory and pricing</p>
        </div>
        <button className="primary-button" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          Add Product
        </button>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <div className="toolbar-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, SKU or barcode"
          />

          <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="all">All Stock Status</option>
            <option value="green">In Stock</option>
            <option value="yellow">Low Stock</option>
            <option value="red">Out of Stock</option>
          </select>
        </div>
      </div>

      {error ? <div className="form-error" style={{ marginTop: 12 }}>{error}</div> : null}

      {showForm ? (
        <div className="panel" style={{ marginTop: 16, padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Product" : "Add Product"}</h3>

          <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" required />
            <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" required />
            <input name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode" />
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input name="purchase_price" type="number" value={form.purchase_price} onChange={handleChange} placeholder="Purchase Price" />
            <input name="selling_price" type="number" value={form.selling_price} onChange={handleChange} placeholder="Selling Price" />
            <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Stock" />
            <input name="minimum_stock" type="number" value={form.minimum_stock} onChange={handleChange} placeholder="Minimum Stock" />
            <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unit" />
            <input name="tax" type="number" value={form.tax} onChange={handleChange} placeholder="Tax" />
            <input name="supplier_id" type="number" value={form.supplier_id} onChange={handleChange} placeholder="Supplier ID" />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product Description" style={{ minHeight: 80, gridColumn: "1 / -1" }} />

            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
              <button type="submit" className="primary-button">{editingId ? "Save" : "Add Product"}</button>
              <button type="button" className="secondary-button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="panel" style={{ marginTop: 16, overflowX: "auto" }}>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Purchase</th>
                <th>Selling</th>
                <th>Stock</th>
                <th>Min</th>
                <th>Status</th>
                <th>Tax</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", color: "#9ca3af" }}>
                    No products found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <small style={{ color: "#9ca3af" }}>{item.description || "No description"}</small>
                      </td>
                      <td>{item.sku}</td>
                      <td>{item.barcode || "-"}</td>
                      <td>{item.category_name || "Uncategorized"}</td>
                      <td>₹{Number(item.purchase_price || 0).toFixed(2)}</td>
                      <td>₹{Number(item.selling_price || 0).toFixed(2)}</td>
                      <td>{item.stock}</td>
                      <td>{item.minimum_stock}</td>
                      <td>
                        <span className={`status-pill ${status}`}>{getStatusLabel(status)}</span>
                      </td>
                      <td>{item.tax || 0}%</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" className="table-button" onClick={() => handleEdit(item)}>Edit</button>
                          <button type="button" className="table-button danger" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default ProductsPage;
