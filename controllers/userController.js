import userModel from "../models/userModel.js";

export const getUserData = async (req,res)=>{
    try{
        console.log("asdfghjkl;");
        const userId = req.userID;
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: "User not found"})
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });

    }catch(e){
        console.log("Error fetching user data");
        res.json({success: false, message: e.message})
    }
}