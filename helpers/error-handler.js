const errorHandler=function(err,req,res,next){
    if(err.name==='UnauthorizedError'){
        return res.status(401).json({
            success : false,
            message :'Unauthorized user'
        })
    }
    if(err.name==='ValidationError'){
        return res.status(401).json({
            success : false,
            message :'Validation error'
        })
    }
   return res.status(500).json({
    success : false,
    message : err
   });
}

module.exports=errorHandler