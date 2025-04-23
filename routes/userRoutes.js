import express from "express"
import { userAuth } from "../middleware/userAuth.js"
import { getUserData ,sendFriendRequest,getFriendRequests,acceptFriendRequest,getFriendList} from "../controllers/userController.js"


const userRouter = express.Router()


userRouter.get('/data', userAuth, getUserData);
userRouter.post('/sendFriendRequest', userAuth, sendFriendRequest);
userRouter.get('/getFriendRequests',userAuth, getFriendRequests);
userRouter.post('/acceptFriendRequest',userAuth, acceptFriendRequest);
userRouter.get('/getFriendList',userAuth, getFriendList);


export default userRouter;