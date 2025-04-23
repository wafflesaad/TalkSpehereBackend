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
    try {
        const userId = req.userID;
        const toEmail = req.body.to;

        if (!userId || !toEmail) {
            return res.json({success:false, message: "Users not found"});
        }

        const fromUser = await userModel.findById(userId);
        const toUser = await userModel.findOne({email:toEmail});

        // Check if users exist
        if (!fromUser || !toUser) {
            return res.json({success:false, message: "User not found"});
        }

        // Check if already friends
        if (fromUser.friendList.includes(toUser._id)) {
            return res.json({success:false, message: "Already friends"});
        }

        // Check if request already exists
        if (toUser.pendingRequests.includes(fromUser._id)) {
            return res.json({success:false, message: "Friend request already sent"});
        }

        toUser.pendingRequests.push(fromUser._id);
        await toUser.save();

        res.json({success:true, message: "Friend request sent successfully"});
    } catch(e) {
        res.json({success:false, message: e.message});
    }
};

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
    try {
        const userId = req.userID;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({success: false, message: "Couldn't find user"});
        }

        const requestIds = user.pendingRequests;
        const friendIds = user.friendList;

        if (!requestIds || requestIds.length === 0) {
            return res.json({success:true, requests: []});
        }

        // Get unique request emails and filter out friends
        const uniqueRequestIds = [...new Set(requestIds.map(id => id.toString()))];
        let requestEmails = [];

        for (const requestId of uniqueRequestIds) {
            // Skip if the request is from someone who is already a friend
            if (friendIds.some(friendId => friendId.toString() === requestId)) {
                continue;
            }

            const tuser = await userModel.findById(requestId);
            if (tuser) {
                requestEmails.push(tuser.email);
            }
        }

        return res.json({success: true, requests: requestEmails});
    } catch(e) {
        res.json({success: false, message: e.message});
    }
};

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
    try {
        const userId = req.userID;
        const fromEmail = req.body.from;

        if (!userId || !fromEmail) {
            return res.json({success: false, message: "Missing required fields"});
        }

        const toUser = await userModel.findById(userId);
        const fromUser = await userModel.findOne({email: fromEmail});

        if (!toUser || !fromUser) {
            return res.json({success: false, message: "User not found"});
        }

        // Convert both IDs to string for comparison
        const fromUserIdStr = fromUser._id.toString();
        
        // Check if the request exists
        const requestExists = toUser.pendingRequests.some(
            requestId => requestId.toString() === fromUserIdStr
        );

        if (!requestExists) {
            return res.json({success: false, message: "Friend request not found"});
        }

        // Remove the request from pending requests
        toUser.pendingRequests = toUser.pendingRequests.filter(
            requestId => requestId.toString() !== fromUserIdStr
        );

        await toUser.save();
        res.json({success: true, message: "Friend request rejected successfully"});
    } catch(e) {
        console.error("Error in deleteFriendRequest:", e);
        res.json({success: false, message: e.message});
    }
};

export const checkUserExists = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (e) {
        res.json({ success: false, message: e.message });
    }
}

export const removeFriend = async (req, res) => {
    try {
        const userId = req.userID;
        const friendEmail = req.body.friendEmail;

        if (!userId || !friendEmail) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const user = await userModel.findById(userId);
        const friend = await userModel.findOne({ email: friendEmail });

        if (!user || !friend) {
            return res.json({ success: false, message: "User or friend not found" });
        }

        // Remove friend from both users' friend lists
        user.friendList = user.friendList.filter(id => id.toString() !== friend._id.toString());
        friend.friendList = friend.friendList.filter(id => id.toString() !== user._id.toString());

        await user.save();
        await friend.save();

        res.json({ success: true, message: "Friend removed successfully" });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
};

export const fuzzySearchUsers = async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || query.length < 2) {
            return res.json({ success: false, message: "Search query must be at least 2 characters long" });
        }

        // Create a case-insensitive regex pattern
        const searchPattern = new RegExp(query, 'i');

        // Search in both name and email fields
        const users = await userModel.find({
            $or: [
                { name: { $regex: searchPattern } },
                { email: { $regex: searchPattern } }
            ]
        }).select('name email');

        // Filter out the current user
        const currentUserId = req.userID;
        const filteredUsers = users.filter(user => user._id.toString() !== currentUserId);

        res.json({
            success: true,
            users: filteredUsers.map(user => ({
                name: user.name,
                email: user.email
            }))
        });
    } catch (e) {
        console.error("Error in fuzzySearchUsers:", e);
        res.json({ success: false, message: e.message });
    }
};