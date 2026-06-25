const express = require("express");
const adminRoute = express.Router();
const Vendor = require("../vendor/vendor.model");
const Customer = require("../customer/customer.model");
const Invoice = require("../invoice/invoice.model");

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

adminRoute.post("/login", (req, res) => {
  try {
    const { userId, password } = req.body;
    if (userId === ADMIN_USER && password === ADMIN_PASS) {
      return res.json({ userId: "admin", name: "Administrator", role: "admin" });
    }
    res.status(401).send("Invalid Admin Credentials");
  } catch (err) {
    console.log(err);
    res.status(500).send("Login Failed");
  }
});

adminRoute.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ VId: 1 });
    res.send(vendors);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch vendors");
  }
});

adminRoute.get("/customers-with-purchases", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ invoiceDate: -1 });
    const customerMap = {};
    for (const inv of invoices) {
      const key = inv.CId;
      if (!customerMap[key]) {
        const customer = await Customer.findOne({ CId: key });
        customerMap[key] = {
          CId: key,
          CustomerName: inv.CustomerName,
          CEmail: inv.CEmail,
          CContact: inv.CContact,
          CAddress: inv.CAddress,
          CUserId: customer ? customer.CUserId : "",
          CPicName: customer ? customer.CPicName : "",
          Status: customer ? customer.Status : "",
          purchases: [],
        };
      }
      customerMap[key].purchases.push({
        invoiceId: inv.invoiceId,
        pid: inv.pid,
        pname: inv.pname,
        opprice: inv.opprice,
        quantity: inv.quantity,
        totalAmount: inv.totalAmount,
        invoiceDate: inv.invoiceDate,
        status: inv.status,
      });
    }
    res.send(Object.values(customerMap));
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch customers with purchases");
  }
});

module.exports = adminRoute;
