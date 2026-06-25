const express = require("express");
const invoiceRoute = express.Router();
const Invoice = require("./invoice.model");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendEmail } = require("../emailUtil");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

invoiceRoute.post("/create", async (req, res) => {
    try {
        const { CId, CustomerName, CContact, CEmail, CAddress, pid, pname, opprice, quantity } = req.body;

        if (!CId || !pid || !pname || !opprice) {
            return res.status(400).json({ error: "Customer ID, Product ID, Product Name, and Price are required" });
        }

        const qty = quantity || 1;
        const totalAmount = Number(opprice) * qty;

        const lastInvoice = await Invoice.findOne().sort({ invoiceId: -1 });
        const newInvoiceId = lastInvoice ? lastInvoice.invoiceId + 1 : 1;

        const invoice = new Invoice({
            invoiceId: newInvoiceId,
            CId: Number(CId),
            CustomerName: CustomerName || "",
            CContact: CContact || "",
            CEmail: CEmail || "",
            CAddress: CAddress || "",
            pid: Number(pid),
            pname,
            opprice: Number(opprice),
            quantity: qty,
            totalAmount,
            status: "Pending"
        });

        await invoice.save();

        sendEmail(CEmail, `Invoice #${newInvoiceId} Generated`, `Dear ${CustomerName},\n\nYour invoice has been generated successfully.\n\nInvoice ID: #${newInvoiceId}\nProduct: ${pname}\nQuantity: ${qty}\nTotal Amount: ₹${totalAmount}\nStatus: Pending\n\nThank you for shopping with us.`);

        res.json({ message: "Invoice created successfully", invoice });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message || "Failed to create invoice" });
    }
});

invoiceRoute.get("/show", async (req, res) => {
    try {
        const data = await Invoice.find().sort({ invoiceId: -1 });
        res.send(data);
    } catch (err) {
        res.status(500).send("Error fetching invoices");
    }
});

invoiceRoute.get("/showbycustomer/:CId", async (req, res) => {
    try {
        const data = await Invoice.find({ CId: Number(req.params.CId) }).sort({ invoiceId: -1 });
        res.send(data);
    } catch (err) {
        res.status(500).send("Error fetching invoices");
    }
});

invoiceRoute.get("/getmaxinvoiceid", async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ invoiceId: -1 }).limit(1);
        if (invoices.length > 0) {
            res.json({ maxInvoiceId: invoices[0].invoiceId, nextInvoiceId: invoices[0].invoiceId + 1 });
        } else {
            res.json({ maxInvoiceId: 0, nextInvoiceId: 1 });
        }
    } catch (err) {
        res.status(500).json({ error: "Error fetching max invoice ID" });
    }
});

invoiceRoute.post("/create-razorpay-order", async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findOne({ invoiceId });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const options = {
      amount: Math.round(invoice.totalAmount * 100),
      currency: "INR",
      receipt: `invoice_${invoiceId}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

invoiceRoute.post("/verify-payment", async (req, res) => {
  try {
    const { invoiceId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const paidInvoice = await Invoice.findOneAndUpdate({ invoiceId }, { status: "Paid" }, { new: true });

    sendEmail(paidInvoice.CEmail, `Payment Successful - Invoice #${invoiceId}`, `Dear ${paidInvoice.CustomerName},\n\nYour payment for Invoice #${invoiceId} has been received successfully.\n\nAmount Paid: ₹${paidInvoice.totalAmount}\nStatus: Paid\n\nThank you for your purchase!`);

    res.json({ message: "Payment verified successfully", status: "Paid" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = invoiceRoute;
