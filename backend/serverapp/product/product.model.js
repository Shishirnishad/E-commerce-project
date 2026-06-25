//product_model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
{
    pid: {
        type: Number,
        required: true,
        unique: true
    },

    pname: {
        type: String,
        required: true
    },

    ppprice: {
        type: Number,
        required: true
    },

    opprice: {
        type: Number,
        required: true
    },

    ppicname: {
        type: String
    },

    pcatgid: {
        type: Number
    },

    vid: {
        type: Number
    },

    status: {
        type: String,
        default: "Inactive"
    },

    pdesc: {
        type: String,
        default: "This is a Branded Company Product"
    }
},
{
    collection: "Product"
}
);

module.exports = mongoose.model("Product", ProductSchema);