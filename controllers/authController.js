import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';
import { use } from 'react';

export const register = async (req,res)=>{

    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message: "Missing details"})
    }

    try{

        const existingUser = await userModel.findOne({email: email})

        if(existingUser){
            return res.json({success: false, message: "User already exists"})
        }

        const hashedPass = await bcrypt.hash(password, 6)

        const user = new userModel({name:name,email:email, password: hashedPass});

        await user.save() ;

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 1*60*60*1000,
        });

        //sending welcome email

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to TalkSphere",
            text: `Welcome ${name}, your TalkSphere account has been created.`
        }

        await transporter.sendMail(mailOptions);


        return res.json({success:true})

    } catch (err){
        res.json({success:false, message: err.message})
    }

    

}

export const login = async (req,res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: "Missing details"})
    }

    try{

        const user = await userModel.findOne({email})

        if (!user){
            return res.json({success:false, message:"Invalid email"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message:"Invalid password"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 1*60*60*1000,
        });

        return res.json({success:true})

    } catch(err){
        return res.json({success:false, message: err.message})
    }

    

}


export const logout = async (req,res)=>{
    try{

        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
            maxAge: 1*60*60*1000,
        })

        return res.json({success:true, message:'logged out'})

    }catch(err){
        return res.json({success:false, message:err.message})
    }
}

export const sendVerifyOtp = async (req,res)=>{
    
    try{

        const {userID} = req.body

        const user = await userModel.findById(userID)

        if (!user){
            return res.json({success:false, message:"user not found"})
        }

        if (user.isAccountVerified){
            return res.json({success:false, message:"account already verified"})
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.verifyOtp = otp;

        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify Email",
            text: `Your verification otp is ${otp}.`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success:true, message:"Otp sent to email."})

    }catch(err){
        return res.json({success:false, message:err.message})
    }

};

export const verifyEmail = async (req,res)=>{
    const {userID,otp} = req.body;

    if(!userID || !otp){
        return res.json({success:false, message:"incomplete body"})
    }

    try{

        const user = await userModel.findById(userID)

        if(!user){
            return res.json({success:false, message:"user not found"})
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success:false, message:"Invalid otp"})
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:"Timeout."})
        }

        user.isAccountVerified = true
        user.verifyOtp = ""
        user.verifyOtpExpireAt = 0

        await user.save()

        return res.json({success: true, message: "User verified"})


    }catch(err){
        return res.json({success:false, message:err.message})
    }

}

export const isAuthenticated = (req,res)=>{

    try{
        return res.json({success:true})
    }catch(err){
        res.json({success:false, message:err.message})
    }

}

export const sendPassResetOtp = async (req,res)=>{
    const {email} = req.body

    if (!email){
        return res.json({success:false, message:"Email not found"})
    }


    try{

        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false, message:"User not found"})    
        }

        const otp = Math.floor(100000 + Math.random()*900000)

        user.resetOtp = otp

        user.resetOtpExpireAt = Date.now() + 60*60*1000

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset password",
            text: `Your reset password otp is ${otp}`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success:true, message:"Reset otp sent to email"})


    }catch(err){
        return res.json({success:false, message:err.message})
    }

}

export const resetPass = async (req,res)=>{

    const {email, otp ,newPass} = req.body
    
    if(!email || !otp || !newPass) {
        return res.json({success:false, message:"Info missing"})
    }

    try{

        const user = await userModel.findOne({email})

        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        if(user.resetOtp !== otp){
            return res.json({success:false,message:"Invalid otp"})
        }

        if (user.resetOtpExpireAt < Date.now()){
            return res.json({success:false,message:"Timeout"})
        }

        user.password = await bcrypt.hash(newPass, 7)
        user.resetOtp = ""
        user.resetOtpExpireAt = 0

        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset password",
            text: `Your password has been reset.`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success:true})

    }catch(err){
        res.json({success:false, message:err.message})
    }

}