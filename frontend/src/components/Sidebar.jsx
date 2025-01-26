import React from "react";
import { Link } from "react-router";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h1>Seller Dashboard</h1>
      <nav>
        <Link to="/bulk-upload">Bulk Upload</Link>
        <Link to="/product-list">Product List</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
