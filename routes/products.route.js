const express = require('express')

const router = express.Router()
const path = require('path');
const multer  = require('multer')
const productsController = require('../controllers/products.controller')
const {verifyToken} = require('../middlewares/verifyToken')
const { v4: uuidv4 } = require('uuid');

// const fileFilter = (req,file,cb)=>{
//     const imageType = file.mimetype.split("/")[0]
//     if(imageType === "image"){
//         return cb(null,true)
//     }else{
//         return cb(appError.create("The file must be an image",400),false)
//     }
// }
 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'ProductsImages/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, Date.now() + uniqueSuffix + path.extname(file.originalname));
    }
})
const upload = multer({
    storage: storage
})


router.route('/')
    .get(productsController.getAllProducts)
    .post(verifyToken,upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'images', maxCount: 10 }
        ]),productsController.addProduct)


router.route('/:productId')
    .get(productsController.getProduct)
    .delete(verifyToken,productsController.deleteProduct)

router.route('/getproducts/get')
    .get(productsController.getProducts)
module.exports = router  