const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true,
    },
    cover:{
        type:String,
        
    },
    images:[String],
    details: [
        {
          size: { type: String, required: true },
          stock: { type: Number, default: 0 }
        }
    ],
})

module.exports = mongoose.model('Product',productSchema)