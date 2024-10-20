const User = require('../models/user.model')
const asyncWrapper = require('../middlewares/asyncWrapper.js')
const {SUCCESS,FAIL,ERROR} = require("../utils/httpStatusText")
const appError = require('../utils/appError.js')
const bcrypt = require('bcryptjs')
const generatejwt = require('../utils/generateJWT.js')
const sendVerificationEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const getAllUsers = asyncWrapper(async (req,res)=>{
    const query = req.query
    const limit = query.limit || 5;
    const page = query.page || 1;
    const skip = (page - 1) * limit
    const users = await User.find({},{"__v":false,'password':false}).limit(limit).skip(skip)
    res.json({status:SUCCESS,data:{users}})
})

const getUser = asyncWrapper( async (req,res)=>{
    const {id} = req.currentUser
    
    const isUser = await User.findOne({_id:id});

    if(!isUser){     
        return res.sendStatus(401)
    }
    return res.json({status:SUCCESS,data:{user:isUser,email:isUser.email}})
})

const register = asyncWrapper(async (req,res,next)=>{   

    const {firstName,lastName,email,password,role} = req.body
    
    if(!firstName){
        return res
           .status(400)
           .json({error:true,message:"First Name is required"})
   };
   if(!lastName){
    return res
       .status(400)
       .json({error:true,message:"Last Name is required"})
};
   if(!email) return res.status(400).json({error:true,message:"Email is required"})
   if(!password) return res.status(400).json({error:true,message:"Password is required"})
    const oldUser = await User.findOne({email:email})
    if(oldUser){
        const error = appError.create("User is already exist",400,FAIL); 
        return next(error);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        role
    })

    
    const token = await generatejwt({email:newUser.email,id:newUser._id})
    newUser.token = token
    await newUser.save()
    
    await sendVerificationEmail(email, token)

    return res.status(201).json({status:SUCCESS,data:{newUser},msg:"Registration successful! Please verify your email."})
})
const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);   
      // Find the user and update isVerified status
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(400).json({ msg: 'Invalid token' });
      }
  
      user.isVerified = true;
      await user.save();
  
      return res.status(200).json({ msg: 'Email verified successfully!. wait redirecting to your Dashboard' });
    } catch (error) {
      return res.status(400).json({ msg: 'Token expired or invalid' });
    }
}
const login = asyncWrapper(
    async (req,res,next)=>{
        const {email,password} = req.body;
        if(!email || !password){
            const error = appError.create("email and password are required",400,FAIL); 
            return next(error);
        }
        const user = await User.findOne({email:email})
        if(!user){
            const error = appError.create("user not founded",500,ERROR); 
            return next(error);
        }
        const matchedPassword = await bcrypt.compare(password,user.password)
         
        if(user.role !== "ADMIN"){
            if(matchedPassword){
                const token = await generatejwt({email:user.email,id:user._id})
                if(!user.isVerified){
                    await sendVerificationEmail(email, token)
                    return res.json({data:{message:"Please verify your email",emailVerified:user.isVerified}})
                }
                res.json({status:SUCCESS,data:{token,emailVerified:user.isVerified,role:user.role,userId:user._id}})
            }else{
                const error = appError.create("wrong password",500,ERROR); 
                return next(error);
            }
        }else{
            if(matchedPassword){
                const token = await generatejwt({email:user.email,id:user._id})
            
                res.json({status:SUCCESS,data:{token,emailVerified:user.isVerified,role:user.role}})
            }else{
                const error = appError.create("wrong password",500,ERROR); 
                return next(error);
            }
            
        }
})
const deleteUser = asyncWrapper(async(req,res,next)=>{
    const user = await User.findById(req.params.userId)
    if (!user){
        const error = appError.create("user not found",404,FAIL);
        return next(error);
    }
    await User.deleteOne({_id:req.params.userId})
    res.status(200).json({status:SUCCESS,data:null})
}
)
const forgotPassword = asyncWrapper(async (req,res,next)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user){
        const error = appError.create("user not found",404,FAIL);
        return next(error);
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 7200000;  
    await user.save();
    console.log(new Date(user.resetPasswordExpires));    
    const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass:  process.env.EMAIL_PASS,
    },
    });

    const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: 'Password Reset',
    html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
    Please click on the following link to complete the process:
    <a href="http://localhost:3000/reset-password/${token}">Reset Now!</a>`,
    };

    transporter.sendMail(mailOptions, (err) => {
    if (err) {
        return res.status(500).json({ message: 'Error sending email' });
    }
    return res.status(200).json({ message: 'Email sent' });
    });
})
const resetPassword = async (req,res)=>{
    const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
  }

  user.password = await bcrypt.hash(password, 10);;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.status(200).json({ message: 'Password reset successful' });
}
module.exports = {
    getAllUsers,
    getUser,
    register,
    verifyEmail,
    login,
    deleteUser,
    forgotPassword,
    resetPassword
}