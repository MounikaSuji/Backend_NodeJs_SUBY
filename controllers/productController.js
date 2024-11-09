const Product = require("../models/Product")
const multer = require('multer');
const Firm = require("../models/Firm");
const Vendor = require("../models/Vendor");
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


const addProduct = async (req, res) => {
    try {
        const { productName, price, category, description, bestSeller } = req.body;
        const image = req.file ? req.file.filename : undefined

        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);
        if (!firm) {
            return res.status(404).json({ error: "No Firm Found" })
        }
        const product = new Product({
            productName,
            price,
            category,
            description,
            bestSeller,
            image,
            firm: firm._id

        })
        const savedProduct = await product.save();
        firm.product.push(savedProduct)
        await firm.save()

        return res.status(200).json({ savedProduct, message: "Product added successfully" })


    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })


    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('firm')
        res.json({ products })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

    }
}

const getProductById = async (req, res) => {
    const productId = req.params.id;
    console.log("productId", productId)
    try {
        const product = await Product.findById(productId).populate('firm')
        if (!product) {
            return res.status(404).json({ error: "Vendor nt found" })
        }
        return res.status(200).json({ product })


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

    }
}

const getProductByFirm = async (req, res) => {

    try {
        const firmId = req.params.firmId;
        console.log("firmId", firmId);
        const firm = await Firm.findById(firmId)
        if(!firm){
            return res.status(404).json({ error: "No Firm Found" })

        }
        const restaurantName = firm.firmName;
        const products = await Product.find({firm:firmId})
        return res.status(200).json({ restaurantName,products })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

    }
}

const deleteProductById = async(req,res)=>{
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId)

        if(!deletedProduct){
            return res.status(404).json({ error: "No Product Found" })

        }
        return res.status(200).json({deletedProduct,message:"Product Deleted Successfully" })
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })

        
    }
}



module.exports =
{
    addProduct: [upload.single('image'), addProduct],
    getProductById,
    getAllProducts,
    getProductByFirm,
    deleteProductById
}