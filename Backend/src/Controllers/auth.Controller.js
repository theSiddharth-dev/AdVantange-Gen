import userModel from "../models/User.model.js";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import config from "../Config/Config.js"
import SessionModel from "../models/Session.model.js"

const registerUser = async(req,res) => {

    const {username,email,password} = req.body;

    const isuserExist = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isuserExist){
       return res.status(409).json({
            message:"Username or email already exist"
        })
    }

    const hashPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password:hashPassword
    })

    const refreshtoken = jwt.sign({
        id:user._id
    },config.JWT_TOKEN,{
        expiresIn:"7d"
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex")

    const session = await SessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const Accesstoken = jwt.sign({
        id:user._id,
        sessionId : session._id
    },config.JWT_TOKEN,{
        expiresIn:"15m"
    })

    res.cookie("refreshToken",refreshtoken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 7*24*60*60*1000
    })

    res.status(201).json({
        message:"User registered Successfully",
        user,
        Accesstoken
    })
    

}

const loginUser = async (req,res) => {
    
    const {email,password} = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const hashPassword = crypto.createHash('sha256').update(password).digest('hex')

    const isPasswordValid = hashPassword === user.password;

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id:user._id,
    },config.JWT_TOKEN,{
        expiresIn:"7d"
    }) 

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session = await SessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    })

    const Accesstoken = jwt.sign({
        id:user._id,
        sessionId: session._id
    },config.JWT_TOKEN,{
        expiresIn:"15m"
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 7*24*60*60*1000
    })

    res.status(200).json({
        message:'Logged in Successfully',
        user:{
            username:user.username,
            email:user.email,
        },
        Accesstoken
    })

}

const getMe = async(req,res) => {

    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message:'Token not found'
        })
    }

    const decoded = jwt.verify(token,config.JWT_TOKEN);

    const user = await userModel.findById(decoded.id)

    res.status(201).json({
        message:"User fetched sucessfully"
    })

}

const Refreshtoken = async (req,res) => {
    const refreshtoken = req.cookies?.refreshToken


    if(!refreshtoken){
        return res.status(401).json({
            message:"Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshtoken, config.JWT_TOKEN)

    const refreshtokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    const session = await SessionModel.findOne({
        refreshtokenHash,
        revoked:false
    })

    if(!session){
        return res.status(401).json({
            message:"Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded._id,
    },config.JWT_TOKEN,{expiresIn:"15m"})

    const newRefreshToken = jwt.sign({id:decoded.id},config.JWT_TOKEN,{expiresIn:"7d"})

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken",newRefreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 7*24*60*1000
    })

    res.status(200).json({
        message:"Access token refreshed successfully",
        accessToken
    })
}

const logoutUser = async (req,res) => {
 
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message:'Refresh token is not found'
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await SessionModel.findOne({
        refreshTokenHash,
        revoked:false,
    })

    if(!session){
        return res.status(400).json({
            message:"Invalid session token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")

    res.status(200).json({
        message:'Logged out Successfully'
    })

}

const logoutAll = async (req,res) => {
    
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message: 'Refresh taken not found'
        })
    }

    const decoded = jwt.verify(refreshToken,config.JWT_TOKEN)

    await SessionModel.updateMany({
        user:decoded.id,
        revoked:false
    },{
        revoked:true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message:"Logged out from all devices successfully"
    })
}

export { registerUser,getMe,Refreshtoken, logoutUser,logoutAll,loginUser};