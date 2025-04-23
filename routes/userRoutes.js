import express from "express"
import { userAuth } from "../middleware/userAuth.js"
import { 
    getUserData,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    getFriendList,
    checkUserExists,
    removeFriend,
    deleteFriendRequest,
    fuzzySearchUsers
} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/sendFriendRequest', userAuth, sendFriendRequest);
userRouter.get('/getFriendRequests', userAuth, getFriendRequests);
userRouter.post('/acceptFriendRequest', userAuth, acceptFriendRequest);
userRouter.get('/getFriendList', userAuth, getFriendList);
userRouter.post('/check-user', userAuth, checkUserExists);
userRouter.post('/remove-friend', userAuth, removeFriend);
userRouter.post('/deleteFriendRequest', userAuth, deleteFriendRequest);
userRouter.post('/search-users', userAuth, fuzzySearchUsers);

export default userRouter;