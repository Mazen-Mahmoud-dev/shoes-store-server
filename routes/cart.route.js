const express = require('express')
const router = express.Router()
const {AddToCartRoute,DelFromCartRoute,getCartProducts,DelAllCart} = require('../controllers/cart.controllers')
const cors = require('cors')
router.use(express.json())
router.use(cors({
    origin:"*",
}))

router.route('/cart')
    .post(AddToCartRoute)
    .get(getCartProducts)

router.route('/cart/:id')
    .delete(DelFromCartRoute)
    
router.route("/cart/empty/all").delete(DelAllCart)
  
router.post('/checkout', (req, res) => {
    cart = []; 
    res.json({ message: 'Order confirmed' });
});

module.exports = router