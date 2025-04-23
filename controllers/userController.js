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
            }
        });

    }catch(e){
        console.log("Error fetching user data");
        res.json({success: false, message: e.message})
    }
}

export const updateName = async (req, res) => {
    try {
        const userId = req.userID;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "Name cannot be empty" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { name: name.trim() },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "Name updated successfully",
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (e) {
        console.log("Error updating user name:", e);
        res.json({ success: false, message: e.message });
    }
}