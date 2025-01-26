import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Sidebar from "./components/Sidebar";
import BulkUploadPage from "./pages/BulkUploadPage";
import ProductListPage from "./pages/ProductListPage";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/bulk-upload" element={<BulkUploadPage />} />
            <Route path="/product-list" element={<ProductListPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
