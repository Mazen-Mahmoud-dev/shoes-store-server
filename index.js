const express = require('express')
require("dotenv").config()
const app = express()
const PORT = process.env.PORT || 4000
const cors = require('cors')
const mongoose = require('mongoose')


// routes
const usersRouter = require('./routes/users.route')
app.use("/",usersRouter)

const productsRouter = require('./routes/products.route')
app.use("/api/products/",productsRouter)

const favouritesRouter = require('./routes/favourites.route')
app.use("/favourites/",favouritesRouter)

const cartRouter = require('./routes/cart.route')
app.use("/api",cartRouter)

app.use(express.json())

app.use(cors({
    origin:"*",
}))
app.use('/ProductsImages',express.static('ProductsImages'))
const {ERROR} = require("./utils/httpStatusText")


app.use((error,req,res,next)=>{
    res.status(error.statusCode || 500).json({status:error.statusText || ERROR,message:error.message,code:error.statusCode || 500,data:null})
})


app.all('*',(req,res,next)=>{
    return res.status(404).json({status:ERROR,message:"This resource is not available"})
})


const url = process.env.MONGO_URL
mongoose.connect(url).then(()=>{
    console.log("mongodb server started")
    
}) 

app.listen(PORT,()=>console.log(`server started at port ${PORT}`))

