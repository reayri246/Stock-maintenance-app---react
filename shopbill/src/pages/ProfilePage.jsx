import { useEffect, useState } from "react";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("shopbill_token")}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Profile fetch failed");

        setProfile(data.user);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section className="dashboard">
        <div className="panel" style={{ padding: "1rem" }}>Loading profile...</div>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>My Profile</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>Admin account details and access</p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      {profile ? (
        <div className="panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 14 }}>
              {(profile.name || "Admin").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{profile.name}</h3>
              <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>{profile.email}</p>
            </div>
          </div>

          <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div className="panel" style={{ minHeight: "auto", background: "#091827", padding: "1rem" }}>
              <small style={{ color: "#9ca3af" }}>Role</small>
              <div style={{ marginTop: 6, fontWeight: 700 }}>{profile.role}</div>
            </div>
            <div className="panel" style={{ minHeight: "auto", background: "#091827", padding: "1rem" }}>
              <small style={{ color: "#9ca3af" }}>Account</small>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Admin</div>
            </div>
            <div className="panel" style={{ minHeight: "auto", background: "#091827", padding: "1rem" }}>
              <small style={{ color: "#9ca3af" }}>Status</small>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Active</div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProfilePage;
