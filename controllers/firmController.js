const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor")
const multer = require('multer');
const path = require('path')

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // folder to store the images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
    try {
        const { firmName, area, category, region, offer } = req.body

        const image = req.file ? req.file.filename : undefined;

        const existingFirm = await Firm.findOne({ firmName });
        if (existingFirm) {
            return res.status(400).json({ error: "Firm with this name already exists" });
        }


        const vendor = await Vendor.findById(req.vendorId)
        if (!vendor) {
            res.status(404).json({ message: "Vendor Not Found" })
        }

        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id
        })
        const savedFirm = await firm.save();
        const firmId = savedFirm._id
        vendor.firm.push(savedFirm)
        await vendor.save()

        return res.status(200).json({ firmId,savedFirm,message: "Firm added successfully" })

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

    }
}

const deleteFirmById = async(req,res)=>{
    try {
        const firmId = req.params.firmId;

        const deletedFirm = await Product.findByIdAndDelete(firmId)

        if(!deletedFirm){
            return res.status(404).json({ error: "No Product Found" })

        }
        return res.status(200).json({deletedFirm,message:"Firm Deleted Successfully" })
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

        
    }
}



module.exports = { addFirm: [upload.single('image'), addFirm],deleteFirmById }