import React, { useState, useEffect } from "react";
import axios from "../api/api";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file || !selectedCategory) {
      setMessage("Please select a file and category.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", selectedCategory);

    setLoading(true);
    try {
      const { data } = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(data.message);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload file.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    if (!selectedCategory) {
      setMessage("Please select a category to download the template.");
      return;
    }
  
    try {
      setLoading(true);
  
      // API call to fetch the Excel template
      const response = await axios.get(
        `/download-template?category=${selectedCategory}`,
        {
          responseType: "blob", // Important for file download
        }
      );
  
      // Dynamically generate the filename based on the category
      const filename = `${selectedCategory}-template.xlsx`;
  
      // Create a URL for the response data (Excel file)
      const url = URL.createObjectURL(new Blob([response.data]));
  
      // Trigger the file download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      setMessage(`Template for ${selectedCategory} downloaded successfully.`);
    } catch (error) {
      console.error("Error downloading template:", error);
      setMessage("Failed to download template.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="main-content">
      <h1>Bulk Upload</h1>
      <div>
        <label>
          Select Category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Select a Category --</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Upload File:
          <input type="file" onChange={handleFileChange} />
        </label>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      <div>
        <button onClick={downloadTemplate} disabled={loading}>
          {loading ? "Downloading..." : "Download Template"}
        </button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default BulkUpload;
