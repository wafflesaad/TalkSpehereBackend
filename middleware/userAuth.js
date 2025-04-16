import jwt from 'jsonwebtoken'

export const userAuth = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false, message: "Token not found!"})
    }

    try{

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        if(!decodedToken.id){
            return res.json({success:false, message: "Token id not found"})
        }

        req.body.userID = decodedToken.id;

        next()

    }catch(err){
        return res.json({success:false, message: err.message})

    }

}