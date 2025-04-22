import jwt from 'jsonwebtoken'

export const userAuth = async (req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false, message: "Token not found!"})
    }

    try{
        console.log("1");
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        
        console.log("2");
        if(!decodedToken.id){
            console.log("3");
            return res.json({success:false, message: "Token id not found"})
        }
        
        console.log("4");
        console.log( decodedToken.id);
        //error is in line blow or smth
        req.userID = decodedToken.id;
        console.log("5");
        console.log(req.userID);
        console.log("6");
        next()

    }catch(err){
        return res.json({success:false, message: err.message})

    }

}