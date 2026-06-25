const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 9191;

// ===============================
// Database Config
// ===============================

const config = require("./DB");

// ===============================
// Routes
// ===============================

const stateRoute = require("./admin/state.route");
const cityRoute = require("./admin/city.route");
const productCatgRoute = require("./admin/productcatg.route");
const adminRoute = require("./admin/admin.route");
const productRoute = require("./product/product.route");
const vendorRoute = require("./vendor/vendor.route");
const customerRoute = require("./customer/customer.route");
const invoiceRoute = require("./invoice/invoice.route");

// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// ===============================
// API Routes
// ===============================

app.use("/state", stateRoute);
app.use("/city", cityRoute);
app.use("/productcatg", productCatgRoute);
app.use("/product", productRoute);
app.use("/vendor", vendorRoute);
app.use("/customer", customerRoute);
app.use("/invoice", invoiceRoute);
app.use("/admin", adminRoute);

// ===============================
// Test Route
// ===============================

app.get("/", (req, res) => {
  res.send("Vendor API Running Successfully");
});

// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(config.URL)
  .then(() => {
    console.log(
      "✅ MongoDB Connected Successfully"
    );
  })
  .catch((err) => {
    console.log(
      "❌ MongoDB Connection Error"
    );
    console.log(err);
  });

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running On Port ${PORT}`
  );
});