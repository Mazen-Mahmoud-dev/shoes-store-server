const User = require('../models/user.model')
const AddToCart = async(userId,product)=>{
    try{
        const user = await User.findById(userId);
        console.log(product);
        
        const existingProduct = user.cartProducts.find(cartProduct => cartProduct._id.equals(product._id) && cartProduct.size === product.details[0].size);
        if(product.details.stock !== 0){
            if (existingProduct) {
                existingProduct.count += 1;
                
                await user.save();
                return { message: 'Product count updated in cart!' };
            }
             user.cartProducts.push({
                _id: product._id,
                title: product.title,
                description: product.description,
                price: product.price, 
                cover: product.cover,
                size:product.details[0]?.size || "M",
                count: 1
            });
            
            await user.save();
            return { message: 'Product added to cart!'};
        }else{
            return {message: 'No Stock'}
        }
         
    }catch(err){
        return {message:err.message}
    }
}
const AddToCartRoute = async(req,res)=>{
     
    try {
        const {userId, product} = req.body;
        
        const result = await AddToCart(userId,product);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

const DelFromCart = async(userId,product)=>{
    try{
        const user = await User.findById(userId);
        const existingProduct = user.cartProducts.find(cartProduct => cartProduct._id.equals(product._id) && cartProduct.size === product.size);
        if(existingProduct && existingProduct.count > 1){
            existingProduct.count -= 1;
            await user.save();
            return { message: 'Product removed from cart!' };
        }
        user.cartProducts = user.cartProducts.filter(item => item.id !== product._id || item.size !== product.size);
        await user.save();
        return { message: 'Product removed from cart' };
    }catch(err){
        return {message:err.message}
     }
}
const DelFromCartRoute = async(req,res)=>{
    
    try {
        const {userId, product} = req.body;
        const result = await DelFromCart(userId,product);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}
const getCartProducts = async(req,res)=>{
    const {userId} = req.query
    
    try{
        const user = await User.findById(userId);
        return res.status(200).json({data:user.cartProducts})
    }catch (err){
        return res.json({msg:"unexpected error try again later."})
    }
    
    
}
const DelAllCart = async(req,res)=>{
    const {userId} = req.query
    
    try{
        const user = await User.findById(userId);
        
        
        user.cartProducts = []
        await user.save()
        return res.status(200).json({data:user.cartProducts,msg:"cart is empty"})
    }catch (err){
        return res.json({msg:"unexpected error try again later."})
    }
    
    
}
module.exports = {
    AddToCartRoute,
    DelFromCartRoute,
    getCartProducts,
    DelAllCart
}