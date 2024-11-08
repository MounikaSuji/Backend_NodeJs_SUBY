const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const secretKey = process.env.WhatIsYourName;

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ error: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log(decoded, "decoded");

        if (!decoded.vendorId) {
            return res.status(400).json({ error: "Invalid token payload" });
        }

        const vendor = await Vendor.findById(decoded.vendorId);
        console.log("vendor", vendor);

        if (!vendor) {
            return res.status(404).json({ error: "Vendor Not Found" });
        }

        req.vendorId = vendor._id;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Invalid Token" });
    }
};

module.exports = verifyToken;
