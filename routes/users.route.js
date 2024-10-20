const express = require('express')
const {verifyToken} = require('../middlewares/verifyToken')
const router = express.Router()
const usersController = require('../controllers/users.controller')

const cors = require('cors')
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cors({
    origin:"*",
}))

router.route('/')
            .get(verifyToken,usersController.getAllUsers)

router.route('/register')
            .post(usersController.register)

router.route('/login')
            .post(usersController.login)


router.route('/get-user')
        .get(verifyToken,usersController.getUser)



// Email verification route
router.route('/verify/:token')
    .get(usersController.verifyEmail) 
   
router.route('/:userId')
    .delete(usersController.deleteUser)


router.route('/api/auth/forgot-password')
    .post(usersController.forgotPassword)

router.post('/api/auth/reset-password/:token',usersController.resetPassword)


module.exports = router 