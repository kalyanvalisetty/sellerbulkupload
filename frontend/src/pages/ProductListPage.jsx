import React, { useState, useEffect } from "react";
import axios from "../api/api";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const { data } = await axios.get(`/api/products?category=${selectedCategory}`);
          setProducts(data);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [selectedCategory]);

  return (
    <div className="main-content">
      <h1>Product List</h1>
      <div className="select-category">
        <label htmlFor="category">Select Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">-- Select a Category --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found for this category.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name || product.title}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductListPage;
