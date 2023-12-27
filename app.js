const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const morgan=require('morgan')
const mongoose=require('mongoose')
const cors=require('cors')

// error and auth
const auth=require('./helpers/jwt')
const errorHandler=require('./helpers/error-handler')


// Router imports
const productRouter=require('./routers/products')
const categoryRouter=require('./routers/category')
const userRouter=require('./routers/user')
const orderRouter=require('./routers/order')

require('dotenv/config')

// cors
app.use(cors())
app.options('*',cors())


const api=process.env.API_URL

 
// middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(auth())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler)
// app.use('/public/uploads',express.static(__dirname+'/public/uploads'))

// Router
app.use(`${api}/products`,productRouter)
app.use(`${api}/category`,categoryRouter)
app.use(`${api}/user`,userRouter)
app.use(`${api}/orders`,orderRouter)




mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("Database connection is ready")
})
.catch((err)=>{
    console.log(err)
})





app.listen(3000,() => {
    console.log('Server is running')
    console.log(api)
})