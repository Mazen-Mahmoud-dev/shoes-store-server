const User = require('../models/user.model')
const {FAIL} = require("../utils/httpStatusText")
const appError = require('../utils/appError.js')


const addToFavourite = async (userId, productId,product)=>{
    try{
        const user = await User.findById(userId);
        const alreadyInFavourites = user.favouriteProducts.some(fav => fav._id.equals(productId));
        if (alreadyInFavourites) {
            return { message: 'Product already in favourites!' };
        }
        user.favouriteProducts.push({
            _id: product._id,
            title: product.title,
            description: product.description,
            price: product.price,
            cover:product.cover
          })
      
          await user.save();
          return { message: 'Product added to Favourites!', product,user };
    }catch (err){
        console.log("err",err);
        
    }
    

    
}

const AddToFavouriteCallingRoute = async (req,res)=>{

    let { productId ,userId,product} = req.body;
    try {
        const result = await addToFavourite(userId, productId,product);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const DeleteFromFavourite = async (userId, productId,product)=>{ 
    const user = await User.findById(userId);

    
    if (!user){
        const error = appError.create("user not found",404,FAIL);
        return next(error);
    }

    user.favouriteProducts = user.favouriteProducts.filter(fav => !fav._id.equals(productId));

    
    await user.save();

    return { message: 'Product Deleted from Favourites!' };
}
const DeleteFromFavouriteCallingRoute = async (req,res)=>{
    const { userId } = req.params;  
    const { productId } = req.query;  
    try {
        const result = await DeleteFromFavourite(userId, productId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getFavouriteProducts = async(userId) => {
      try{
        const user = await User.findById(userId)
        return user.favouriteProducts;
      }
      catch (err){
        console.log("error: ");
        
      }
      
}
  
const getFavouriteProductsRoute = async (req, res) => {
    try {
        
        const { userId } = req.body;
        console.log(req.body);
        
        const favouriteProducts = await getFavouriteProducts(userId);
        res.status(200).json({data:favouriteProducts});
    } catch (error) {
      console.error("Error:");
      res.status(500).json({ message: error.message});
    }
  }



module.exports = {
    AddToFavouriteCallingRoute,
    DeleteFromFavouriteCallingRoute,
    getFavouriteProductsRoute
}