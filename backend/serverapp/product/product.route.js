const express = require("express");
const productRoute = express.Router();
const Product = require("./product.model");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

require("dotenv").config();

/* ================= CLOUDINARY ================= */

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

/* ================= MULTER ================= */

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "product_images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const upload = multer({ storage });

/* ================= SAVE PRODUCT WITH IMAGE ================= */

productRoute.post("/saveproduct", upload.single("file"), async (req, res) => {
    try {
        const body = req.body || {};

        const { pid, pname, ppprice, opprice, pcatgid, vid, status, pdesc } = body;

        if (!pid || !pname || !ppprice || !opprice) {
            return res.status(400).json({
                error: "Product ID, Name, Wholesale Price, and Retail Price are required"
            });
        }

        let ppicname = '';
        if (req.file) {
            ppicname = req.file.path;
        }

        const product = new Product({
            pid: Number(pid),
            pname,
            ppprice: Number(ppprice),
            opprice: Number(opprice),
            ppicname,
            pcatgid: pcatgid ? Number(pcatgid) : undefined,
            vid: vid ? Number(vid) : undefined,
            status: status || "Inactive",
            pdesc: pdesc || "This is a Branded Company Product"
        });

        await product.save();

        res.json({
            message: "Product added successfully",
            product,
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message || "Failed to save product"
        });
    }
});

/* ================= UPLOAD IMAGE ONLY ================= */

productRoute.post(
    "/saveproductimage",
    upload.single("file"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                error: "No file",
            });
        }

        res.json({
            imageUrl: req.file.path,
            publicId: req.file.filename,
        });
    }
);

/* ================= FETCH ================= */

productRoute.get(
    "/showproductbyvendor/:vid",
    async (req, res) => {
        try {
            const data = await Product.find({
                vid: Number(req.params.vid),
            });
            res.send(data);
        } catch (err) {
            res.status(500).send("Error fetching products");
        }
    }
);

productRoute.get(
    "/showproduct",
    async (req, res) => {
        try {
            const data = await Product.find();
            res.send(data);
        } catch (err) {
            res.status(500).send("Error fetching products");
        }
    }
);

productRoute.get(
    "/showproductbycatgid/:pcatgid",
    async (req, res) => {
        try {
            const data = await Product.find({
                pcatgid: Number(req.params.pcatgid),
            });
            res.send(data);
        } catch (err) {
            res.status(500).send("Error fetching products");
        }
    }
);

productRoute.get(
    "/showproductbystatus/:status",
    async (req, res) => {
        try {
            const data = await Product.find({
                status: req.params.status,
            });
            res.send(data);
        } catch (err) {
            res.status(500).send("Error fetching products");
        }
    }
);

/* ================= GET MAX PRODUCT ID ================= */

productRoute.get(
    "/getmaxpid",
    async (req, res) => {
        try {
            const products = await Product.find().sort({ pid: -1 }).limit(1);
            
            if (products.length > 0) {
                res.json({ maxPid: products[0].pid, nextPid: products[0].pid + 1 });
            } else {
                res.json({ maxPid: 0, nextPid: 1 });
            }
        } catch (err) {
            res.status(500).json({ error: "Error fetching max product ID" });
        }
    }
);

/* ================= UPDATE ================= */

productRoute.put(
    "/updateproduct/:pid",
    upload.single("file"),
    async (req, res) => {
        try {
            const updateData = { ...req.body };

            if (req.file) {
                updateData.ppicname = req.file.path;
            }

            await Product.updateOne(
                { pid: Number(req.params.pid) },
                { $set: updateData }
            );

            res.json({ message: "Product updated successfully" });
        } catch (err) {
            res.status(500).json({ error: "Update failed" });
        }
    }
);

productRoute.put(
    "/updateproductstatus/:pid/:status",
    async (req, res) => {
        try {
            await Product.updateOne(
                { pid: Number(req.params.pid) },
                { status: req.params.status }
            );

            res.json({ message: "Product status updated successfully" });
        } catch (err) {
            res.status(500).json({ error: "Status update failed" });
        }
    }
);

/* ================= DELETE ================= */

productRoute.delete(
    "/deleteproduct/:pid",
    async (req, res) => {
        try {
            await Product.deleteOne({ pid: Number(req.params.pid) });
            res.json({ message: "Product deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: "Delete failed" });
        }
    }
);

module.exports = productRoute;