import userModel from "../models/userModel.js";

export const getUserData = async (req,res)=>{
    try{
        // console.log("asdfghjkl;");
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

        toUser.pendingRequests.push(fromUser._id);

        await toUser.save();

        res.json({success:true});

    } 
    catch(e){
        res.json({success:false, message: e.message})
    }
}
export const getFriendList = async (req,res)=>{

    try{
        const userId = req.userID;

        const user = await userModel.findById(userId);

        if (!user){
            return res.json({success: false, message: "Couldn't find user"})
        }

        const friendIds = user.friendList;

        if (!friendIds){
            return res.json({success: false, message: "Couldn't find requests"})
        } else if(friendIds.length == 0){
            return res.json({success:false, message: "No friends"})
        }

        let friendEmails = []

        for (var friendId of friendIds){

            const tuser = await userModel.findById(friendId);

            friendEmails.push(tuser.email);

        }

        return res.json({success: true, friends: friendEmails});

    } catch(e){
        res.json({success: false, message: e.message})
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

        for (var requestId of requestIds){

            const tuser = await userModel.findById(requestId);

            requestEmails.push(tuser.email);

        }

        return res.json({success: true, requests: requestEmails});

    } catch(e){
        res.json({success: false, message: e.message})
    }
    

}

export const acceptFriendRequest = async (req,res)=>{


    try{
        const userId = req.userID;

        const fromEmail = req.body.from;

        const fromUser = await userModel.findOne({email:fromEmail})
        const toUser = await userModel.findById(userId)

        fromUser.friendList.push(toUser._id)
        toUser.friendList.push(fromUser._id)

        await fromUser.save()
        await toUser.save()
        
        return  res.json({success:true, message:"Friends added"})
    } catch(e){
        res.json({success:false, message:e.message})
    }




}

export const deleteFriendRequest = async (req,res)=>{

    const userId = req.userID;
    const fromEmail = req.body.from;

    try{

        const toUser = await userModel.findById(userId)
        const fromUser = await userModel.findOne({email:fromEmail})

        toUser.pendingRequests = toUser.pendingRequests.filter(
            requestId => requestId.toString() !== fromUser._id.toString()
          );

        await toUser.save()

        res.json({ success: true, message: "Friend request deleted" });

    }catch(e){
        res.json({ success: false, message: e.message });
    }
}