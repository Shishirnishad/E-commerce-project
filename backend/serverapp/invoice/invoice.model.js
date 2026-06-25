const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
{
    invoiceId: {
        type: Number,
        required: true,
        unique: true
    },
    CId: {
        type: Number,
        required: true
    },
    CustomerName: {
        type: String,
        required: true
    },
    CContact: {
        type: String
    },
    CEmail: {
        type: String
    },
    CAddress: {
        type: String
    },
    pid: {
        type: Number,
        required: true
    },
    pname: {
        type: String,
        required: true
    },
    opprice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending"
    }
},
{
    collection: "Invoice"
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
