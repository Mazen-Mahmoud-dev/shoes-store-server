const express = require('express')
const {verifyToken} = require('../middlewares/verifyToken')
const router = express.Router()
const favouritesController = require('../controllers/favourites.controller')
const cors = require('cors')
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors({
    origin:"*",
}))


router.route('/get')
    .post(favouritesController.getFavouriteProductsRoute)

router.use('/:userId/favourites', verifyToken);

router.route('/:userId/favourites')
    .post(favouritesController.AddToFavouriteCallingRoute)
    .delete(favouritesController.DeleteFromFavouriteCallingRoute);

module.exports = router 