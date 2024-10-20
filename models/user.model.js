const mongoose = require('mongoose');
const Validator = require('validator');
const userRoles = require('../utils/userRoles');
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
        validate:[Validator.isEmail,"filled must be a valid email"]
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        enum:[userRoles.USER,userRoles.ADMIN,userRoles.MANAGER],
        default:userRoles.USER
    },
    token:{
        type:String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    favouriteProducts:{
        type:[{
            _id: { type: mongoose.Schema.Types.ObjectId },
            title: { type: String },
            description: { type: String },
            price: { type: Number },
            cover:{ type:String }
        }],
        default:[]
    },

    cartProducts:{
        type:[{
            _id: { type: mongoose.Schema.Types.ObjectId },
            title: { type: String },
            description: { type: String },
            price: { type: Number },
            cover:{ type:String },
            size:{type:String},
            count:{ type: Number }
        }],
        default:[]
    }
})

module.exports = mongoose.model('User',userSchema)