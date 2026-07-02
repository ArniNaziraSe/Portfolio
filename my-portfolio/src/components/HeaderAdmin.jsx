import React from "react";

function HeaderAdmin({ title = "Overview" }) {
  return (
    <header className="workspace-header-simple">
      <h1>{title}</h1>
      <span className="welcome-back">Welcome back, Arni</span>
    </header>
  );
}

export default HeaderAdmin;