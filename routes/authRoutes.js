import express from "express";
import { register , login, logout, verifyEmail, sendVerifyOtp, 
    resetPass, sendPassResetOtp ,isAuthenticated} from "../controllers/authController.js";
import {userAuth} from '../middleware/userAuth.js';

const authRouter = express.Router()

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/logout', logout);

authRouter.post('/send_verify_otp',userAuth, sendVerifyOtp);

authRouter.post('/verify_email',userAuth, verifyEmail);

authRouter.post('/is_auth',userAuth, isAuthenticated);

authRouter.post('/send_reset_otp',sendPassResetOtp);

authRouter.post('/reset_pass', resetPass);


export default authRouter;