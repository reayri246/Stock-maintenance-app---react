import React from "react";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";


function Topbar({
  setSidebarOpen,
  activePage,
}) {
  const pageSubtitle =
    activePage === "Dashboard"
      ? "Today's Overview"
      : `${activePage} Overview`;

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


        <button className="profile">

          <div className="avatar">
            MR
          </div>

          <div className="profile-info">

            <strong>
              Store Admin
            </strong>

            <small>
              Administrator
            </small>

          </div>

          <ChevronDown size={14} />

        </button>

      </div>

    </header>
  );
}

export default Topbar;