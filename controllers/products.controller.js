const Product = require('../models/products.model')
const {validationResult} = require('express-validator')
const {SUCCESS,FAIL,ERROR} = require("../utils/httpStatusText")
const asyncWrapper = require('../middlewares/asyncWrapper')
const appError = require('../utils/appError')

const addProduct =asyncWrapper(
    async (req,res,next)=>{ 
        const errors = validationResult(req)
        const {title,description,price,details} = req.body
        const images = req.files['images'] ? req.files['images'].map(file => `ProductsImages/${file.filename}`) : [];
        const coverImagePath = req.files.cover ? `ProductsImages/${req.files['cover'][0].filename}` : ''; // For the cover image        
        if(!errors.isEmpty()){
            const error = appError.create(errors.array(),404,FAIL);
            return next(error);       
        }

        const newProduct = new Product({
            title,
            description,
            price,
            cover:coverImagePath,
            images,
            details
        })
        await newProduct.save()
        res.status(201).json({status:SUCCESS,data:{product:newProduct}})  
    }
)


const getAllProducts = asyncWrapper(async (req,res)=>{
    const query = req.query
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit
    const products = await Product.find({},{"__v":false}).limit(limit).skip(skip)
    res.json({status:SUCCESS,data:{products}})
})
const getProducts = async (req,res)=>{
    try{
        const products = await Product.find({},{"__v":false})
        res.json({status:SUCCESS,data:{products}})
    }catch (err){
        res.json({status:400,msg:"get products failed"})
    }
}

const getProduct = asyncWrapper(
    async (req,res,next)=>{

        const product = await Product.findById(req.params.productId,{"__v":false})
        if (!product){
            const error = appError.create("Product Not Found",404,FAIL);
            return next(error);
        } 
        
        
        return res.json({status:SUCCESS,data:{product}})
    }
)
const deleteProduct = asyncWrapper(async(req,res,next)=>{
    const product = await Product.findById(req.params.productId)
    
        if (!product){
            const error = appError.create("Product not found",404,FAIL);
            return next(error);
        }
        await Product.deleteOne({_id:req.params.productId})
        res.status(200).json({status:SUCCESS,data:null})
}
)
module.exports = {
    addProduct,
    getAllProducts,
    getProduct,
    deleteProduct,
    getProducts
} 