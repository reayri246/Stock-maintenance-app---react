import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";


function Topbar({
  setSidebarOpen,
  activePage,
}) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("shopbill_user") || "{}");
    } catch (error) {
      return {};
    }
  }, []);

  const pageSubtitle =
    activePage === "Dashboard"
      ? "Today's Overview"
      : `${activePage} Overview`;

  const initials = (user.name || "Store Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logout = () => {
    localStorage.removeItem("shopbill_token");
    localStorage.removeItem("shopbill_user");
    navigate("/login");
  };

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <Menu size={20} />
        </button>

        <div>

          <h1>
            {activePage}
          </h1>

          <p>
            {pageSubtitle}

            <span className="live-dot" />

            Live
          </p>

        </div>

      </div>


      <div className="topbar-right">

        <button className="top-icon">
          <Search size={16} />
        </button>

        <button className="top-icon notification">
          <Bell size={16} />

          <span />
        </button>

        <div className="profile-menu-wrap">
          <button className="profile" onClick={() => setProfileOpen((open) => !open)}>
            <div className="avatar">
              {initials || "MR"}
            </div>

            <div className="profile-info">
              <strong>{user.name || "Store Admin"}</strong>
              <small>{user.role || "Administrator"}</small>
            </div>

            <ChevronDown size={14} />
          </button>

          {profileOpen ? (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <div className="avatar small">{initials || "MR"}</div>
                <div>
                  <strong>{user.name || "Store Admin"}</strong>
                  <small>{user.email || "User"}</small>
                </div>
              </div>

              <button type="button" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                <User size={14} /> Open profile
              </button>

              {user.role === "admin" ? (
                <button type="button" onClick={() => { setProfileOpen(false); navigate("/roles-permissions"); }}>
                  <ShieldCheck size={14} /> Staff permissions
                </button>
              ) : null}

              <button type="button" className="logout-button" onClick={logout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : null}
        </div>

      </div>

    </header>
  );
}

export default Topbar;