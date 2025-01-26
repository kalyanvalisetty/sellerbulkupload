const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

// Mock database for products
let productsDB = [];

// Multer setup for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Categories and their corresponding columns
const categoryColumns = {
  Electronics: [
    { header: "Product Name", key: "name", width: 30 },
    { header: "Price", key: "price", width: 15 },
    { header: "Brand", key: "brand", width: 20 },
    { header: "Warranty", key: "warranty", width: 15 },
  ],
  Clothing: [
    { header: "Product Name", key: "name", width: 30 },
    { header: "Price", key: "price", width: 15 },
    { header: "Size", key: "size", width: 10 },
    { header: "Color", key: "color", width: 15 },
  ],
  Books: [
    { header: "Book Title", key: "title", width: 30 },
    { header: "Author", key: "author", width: 20 },
    { header: "Price", key: "price", width: 15 },
    { header: "ISBN", key: "isbn", width: 20 },
  ],
};

// Route: Upload Excel and Parse Data
router.post("/upload", upload.single("file"), async (req, res) => {
  const { file, body: { category } } = req;

  if (!file || !category || !categoryColumns[category]) {
    return res.status(400).json({ message: "Invalid file or category." });
  }

  const filePath = file.path;

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const parsedRows = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowData = {};
        categoryColumns[category].forEach((col, index) => {
          rowData[col.key] = row.getCell(index + 1).value;
        });
        parsedRows.push({ ...rowData, category });
      }
    });

    // Add parsed rows to mock database
    productsDB.push(...parsedRows);

    res.status(200).json({ message: "File uploaded and processed successfully." });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ message: "Error processing file." });
  } finally {
    await fs.unlink(filePath); // Clean up uploaded file
  }
});

// Route: Fetch Categories
router.get("/api/categories", (req, res) => {
  res.status(200).json(Object.keys(categoryColumns));
});

// Route: Fetch Products by Category
router.get("/api/products", (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  const filteredProducts = productsDB.filter(
    (product) => product.category === category
  );
  res.json(filteredProducts);
});

// Route: Download Excel Template
router.get("/download-template", async (req, res) => {
  const { category } = req.query;

  if (!category || !categoryColumns[category]) {
    return res.status(400).json({ message: "Invalid category." });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    // Set columns dynamically based on category
    worksheet.columns = categoryColumns[category];

    // Add a sample row
    const sampleRow = categoryColumns[category].reduce((row, col) => {
      row[col.key] = `Sample ${col.header}`;
      return row;
    }, {});
    worksheet.addRow(sampleRow);

    // Generate a filename based on the category
    const filename = `${category}-template.xlsx`;

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Send workbook to client
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ message: "Failed to generate template" });
  }
});

module.exports = router;
