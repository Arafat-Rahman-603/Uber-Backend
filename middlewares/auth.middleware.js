import userModel from "../models/user.model.js";
import riderModel from "../models/rider.model.js";
import blacklistTokenModel from "../models/blacklistToken.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = async(req,res,next) => {
    let token;
    if(req.cookies.token){
        token = req.cookies.token;
    }else if(req.headers.authorization){
        token = req.headers.authorization.split(" ")[ 1 ] || req.cookies.token;
    }else{
        return res.status(401).json({message: "Unauthorized"});
    }

    if(await blacklistTokenModel.findOne({token})) return res.status(401).json({message: "Unauthorized"});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if(!user) return res.status(401).json({message: "Unauthorized"});
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"});
    }
}


export const authMiddlewareRider = async(req,res,next) => {
    let token;
    if(req.cookies.token){
        token = req.cookies.token;
       
    }else if(req.headers.authorization){
        token = req.headers.authorization.split(" ")[ 1 ] || req.cookies.token;
       
    }else{
        return res.status(401).json({message: "Unauthorized"});
    }

    if(await blacklistTokenModel.findOne({token})) return res.status(401).json({message: "Unauthorized"});
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const rider = await riderModel.findById(decoded.id);
        if(!rider) return res.status(401).json({message: "Unauthorized"});
        req.rider = rider;
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized"});
    }
}
