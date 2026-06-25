const express = require("express");
const customerRoute = express.Router();

const Customer = require("./customer.model");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { sendEmail } = require("../emailUtil");

// =============================
// Cloudinary Configuration
// =============================

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// =============================
// Multer Configuration
// =============================

const upload = multer({
  storage: multer.memoryStorage(),
});

// =============================
// Cloudinary Upload Function
// =============================

async function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "customer_images",
        public_id: Date.now() + "-" + filename,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

// =============================
// Customer Login
// =============================
customerRoute.post("/login", async (req, res) => {
  try {
    const { CUserId, CUserPass } = req.body;

    const customer = await Customer.findOne({
      CUserId: CUserId,
      CUserPass: CUserPass,
    });

    if (!customer) {
      return res.status(401).send("Invalid User ID or Password");
    }

    sendEmail(customer.CEmail, 'Login Notification', `Dear ${customer.CustomerName}, you have successfully logged into your account.`);

    res.send(customer);
  } catch (err) {
    console.log(err);
    res.status(500).send("Login Failed");
  }
});

// =============================
// Get All Customers (for duplicate checking)
// =============================
customerRoute.get("/getcustomercount", async (req, res) => {
  try {
    const customer = await Customer.find({}, "CUserId CEmail CustomerName CId Status");
    res.send(customer);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch customer");
  }
});

// =============================
// Customer Registration
// =============================
customerRoute.post("/register", upload.single('file'), async (req, res) => {
  try {

    const body = req.body || {};

    // helper: case-insensitive lookup + simple token match
    const lowerMap = Object.keys(body).reduce((acc, k) => {
      acc[k.toLowerCase()] = k;
      return acc;
    }, {});

    const getField = (variants, tokens) => {
      for (const v of variants) {
        if (body[v] !== undefined) return body[v];
        const key = lowerMap[v.toLowerCase()];
        if (key) return body[key];
      }
      if (tokens && tokens.length) {
        for (const k of Object.keys(body)) {
          const lk = k.toLowerCase();
          if (tokens.every(t => lk.includes(t))) return body[k];
        }
      }
      return undefined;
    };

    const CUserId = getField(['CUserId','cuserid','userId'], ['user','id']);
    const CUserPass = getField(['CUserPass','cuserpass','password'], ['pass','word']);
    const CustomerName = getField(['CustomerName','customerName','customername','customernam'], ['customer','name']);
    const CEmail = getField(['CEmail','cemail','email'], ['email']);
    const CAddress = getField(['CAddress','caddress','address'], ['address','addr']);
    const CContact = getField(['CContact','ccontact','contact','phone'], ['contact','phone']);
    const CStid = getField(['CStid','cstid','stid'], ['st','id']);
    const CCtid = getField(['CCtid','cctid','ctid'], ['ct','id']);

    if (!CUserId || !CUserPass || !CustomerName || !CEmail) {
      return res.status(400).send('User ID, Password, Customer Name, and Email are required');
    }

    const existingCustomer = await Customer.findOne({
      $or: [
        { CUserId: CUserId },
        { CEmail: CEmail }
      ]
    });

    if (existingCustomer) {
      return res.status(400).send('User ID or Email already exists');
    }

    const lastCustomer = await Customer.findOne().sort({ CId: -1 });
    const newCId = lastCustomer ? lastCustomer.CId + 1 : 1;

    // upload file if present
    let picUrl = '';
    if (req.file) {
      try {
        picUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        if (picUrl) console.log('Cloudinary uploaded:', picUrl);
      } catch (e) {
        console.error('Cloudinary upload failed:', e && e.message ? e.message : e);
      }
    }

    const customer = new Customer({
      CUserId,
      CUserPass,
      CustomerName,
      CAddress: CAddress || '',
      CContact: CContact || '',
      CEmail,
      CStid: CStid !== undefined && CStid !== '' ? Number(CStid) : undefined,
      CCtid: CCtid !== undefined && CCtid !== '' ? Number(CCtid) : undefined,
      CPicName: picUrl,
      CId: newCId,
      Status: 'Inactive'
    });

    console.log('=================================');
    console.log('CUSTOMER OBJECT:');
    console.log(customer);
    console.log('=================================');

    await customer.save();
    // send registration email (non-blocking)
    sendEmail(customer.CEmail, 'Customer Registration Successful', 'Dear Customer, your registration is successful. Admin approval is required before login.');

    res.send('Registration Successful');

  } catch (err) {
    console.log('=================================');
    console.log('FULL ERROR:');
    console.log(err);
    console.log('=================================');
    res.status(400).send(err.message || 'Registration Failed');
  }
});
// =============================
// Update Customer Status
// =============================

customerRoute.put(
  "/Customermanage/:cid/:status",
  async (req, res) => {
    try {
      await Customer.updateOne(
        {
          CId: req.params.cid,
        },
        {
          Status: req.params.status,
        }
      );

      res.send(
        "Customer Status Updated Successfully"
      );
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send("Status Update Failed");
    }
  }
);

// =============================
// Update Customer Profile
// =============================

customerRoute.put(
  "/update/:CUserId",
  upload.single("file"),
  async (req, res) => {
    try {
      const customer =
        await Customer.findOne({
          CUserId:
            req.params.CUserId,
        });

      if (!customer) {
        return res
          .status(404)
          .send("Customer Not Found");
      }

      let imageUrl =
        customer.CPicName;

      if (req.file) {
        imageUrl =
          await uploadToCloudinary(
            req.file.buffer,
            req.file.originalname
          );
      }

      const updatedData = {
        CustomerName:
          req.body.CustomerName ||
          customer.CustomerName,

        CAddress:
          req.body.CAddress ||
          customer.CAddress,

        CContact:
          req.body.CContact ||
          customer.CContact,

        CEmail:
          req.body.CEmail ||
          customer.CEmail,

        CPicName: imageUrl,
      };

      await Customer.updateOne(
        {
          CUserId:
            req.params.CUserId,
        },
        {
          $set: updatedData,
        }
      );

      res.send({
        message:
          "Profile Updated Successfully",
        updatedData,
      });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send("Profile Update Failed");
    }
  }
);

// =============================
// Change Password (logged-in user)
// =============================

customerRoute.put("/changepassword", async (req, res) => {
  try {
    const { CUserId, currentPassword, newPassword } = req.body;

    if (!CUserId || !currentPassword || !newPassword) {
      return res.status(400).send("All fields are required");
    }

    const customer = await Customer.findOne({ CUserId });

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    if (customer.CUserPass !== currentPassword) {
      return res.status(401).send("Current password is incorrect");
    }

    await Customer.updateOne({ CUserId }, { CUserPass: newPassword });

    res.send("Password changed successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Password change failed");
  }
});

// =============================
// OTP Storage
// =============================

let otpStore = {};

// =============================
// Send OTP
// =============================

customerRoute.post(
  "/sendotp",
  async (req, res) => {
    try {
        const { email } = req.body;

      const customer =
        await Customer.findOne({
          CEmail: email,
        });

      if (!customer) {
        return res
          .status(404)
          .send("Email Not Found");
      }

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      );

      otpStore[email] = otp;
      sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

      res.send("OTP Sent");
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send("Failed To Send OTP");
    }
  }
);

// =============================
// Verify OTP
// =============================

customerRoute.post(
  "/verifyotp",
  (req, res) => {
    const { email, otp } =
      req.body;

    if (
      otpStore[email] &&
      otpStore[email] ==
        otp
    ) {
      return res.send(
        "OTP Verified"
      );
    }

    res
      .status(400)
      .send("Invalid OTP");
  }
);

// =============================
// Reset Password
// =============================

customerRoute.put(
  "/resetpassword",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      await Customer.updateOne(
        {
          CEmail: email,
        },
        {
          CUserPass: password,
        }
      );

      delete otpStore[email];

      res.send(
        "Password Updated Successfully"
      );
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send(
          "Password Update Failed"
        );
    }
  }
);



module.exports = customerRoute;