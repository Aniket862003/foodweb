const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const chalk = require("chalk");
const figlet = require("figlet");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

dotenv.config(); // Load environment variables
connectDB(); // Connect to the database

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
const PORT = process.env.PORT || 5000;

// Server Start
app.listen(PORT, () => {
  console.log(
    chalk.cyan(
      figlet.textSync("Food Delivery", { horizontalLayout: "full" })
    )
  );
  console.log(chalk.green.bold(`🚀 Server running on port ${PORT} ✅`));
  console.log(chalk.yellow(`📡 API Base URL: http://localhost:${PORT}/api`));
  console.log(chalk.blue(`🕒 Started at: ${new Date().toLocaleString()}`));
});
