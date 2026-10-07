import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
};

function StaffPermissionsPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");

      setMessage(data.message || "User deleted");
      await fetchStaff();
    } catch (error) {
      setMessage(error.message || "Delete failed");
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/staff", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load staff");
      setStaff(data.staff || []);
    } catch (error) {
      setMessage(error.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Staff creation failed");

      setForm(emptyForm);
      setMessage(`Staff user created successfully: ${form.email}`);
      await fetchStaff();
    } catch (error) {
      setMessage(error.message || "Staff create failed");
    }
  };

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Staff Permissions</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Manage role-based access for shop staff</p>
        </div>
      </div>

      {message ? <div className="form-error" style={{ marginBottom: 12 }}>{message}</div> : null}

      <div className="panel" style={{ padding: "1rem", marginBottom: 16 }}>
        <h3>Add Staff</h3>
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
            <option value="inventory">Inventory</option>
            <option value="staff">Staff</option>
          </select>
          <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1" }}>
            <button type="submit" className="primary-button">Create Staff Account</button>
          </div>
        </form>
      </div>

      <div className="panel" style={{ overflowX: "auto", padding: "1rem" }}>
        {loading ? (
          <p>Loading staff...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "#9ca3af" }}>No staff found</td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button type="button" className="secondary-button" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </button>
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

export default StaffPermissionsPage;
