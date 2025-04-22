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
                email: user.email
            }
        });

    }catch(e){
        console.log("Error fetching user data");
        res.json({success: false, message: e.message})
    }
}

export const sendFriendRequest = async (req,res)=>{
    try{

        const userId = req.userID;

        const toEmail = req.body.to;

        if (!userId || !toEmail){
            return res.json({success:false, message: "Users not found"})
        }

        const fromUser = await userModel.findById(userId);
        const toUser = await userModel.findOne({email:toEmail});

        toUser.penddingRequests.push(fromUser._id);

        await toUser.save();

        res.json({success:true});

    } 
    catch(e){
        res.json({success:false, message: e.message})
    }
}

export const getFriendRequests = async (req,res)=>{

    try{
        const userId = req.userID;

        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success: false, message: "Couldn't find user"})
        }

        const requestIds = user.pendingRequests;

        if (!requestIds){
            return res.json({success: false, message: "Couldn't find requests"})
        } else if(requestIds.length == 0){
            return res.json({success:false, message: "No friend requests"})
        }

        let requestEmails = []

        for (requestId in requestIds){

            const tuser = await userModel.findById(requestId);

            requestEmails.push(tuser.email);

        }

        return res.json({success: true, requests: requestEmails});

    } catch(e){
        res.json({success: false, message: e.message})
    }
    

}


export const acceptFriendRequest = async (req,res)=>{

    const userId = req.userID;

    const fromId = req.body.from;


}

export const deleteFriendRequest = async (req,res)=>{

    const userId = req.userID;
    const fromId = req.user


}