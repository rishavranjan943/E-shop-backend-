const mongoose=require('mongoose')

const orderSchema=mongoose.Schema({
    orderitems : [{
        type : mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        required :true
    }],
    shippingAddress1 : {
        type:String,
        required:true
    },
    shippingAddress2 :{
        type:String
    },
    city : {
        type:String,
        required:true
    },
    zip : {
        type:Number,
        required:true
    },
    country :{
        type:String,
        required:true
    },
    phone :{
        type:Number,
        required:true
    },
    status :{
        type:String,
        required:true,
        default:'Pending'
    },
    totalPrice :{
        type:Number
    },
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    dateOrdered:{
        type:Date,
        default:Date.now
    }
})

orderSchema.virtual('id').get(function(){
    return this._id.toHexString()
})

orderSchema.set('toJSON',{
    virtuals : true
})

const Order=mongoose.model('Order',orderSchema)

module.exports=Order