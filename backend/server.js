const express = require("express");
const dotenv = require("dotenv");

const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const path = require("path");

dotenv.config(); // Load environment variables


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/superadmin", superAdminRoutes);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Server Port
const PORT = process.env.PORT || 5000; // Corrected the PORT assignment
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));