const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const faqRoutes = require("./routes/faqRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/api/faqs", faqRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`AI FAQ Assistant running at http://localhost:${PORT}`);
});
