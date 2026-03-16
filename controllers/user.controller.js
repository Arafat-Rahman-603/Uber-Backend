import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import blacklistTokenModel from "../models/blacklistToken.model.js";

export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;

   const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await userModel.create({
    fullName: {
      firstName: fullName.firstName,
      lastName: fullName.lastName,
    },
    email,
    password: await userModel.hashPassword(password),
  });

  const token = user.generateToken();
  res.cookie("token", token);
  res
    .status(201)
    .json({ message: "User registered successfully", user, token });
};


export const loginUser = async(req,res,next) => {
      const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
      }

      const { email  ,password } = req.body;

      if(!email || !password) return res.status(401).json({ message: "All fields are required" });

      const user = await userModel.findOne({email}).select('+password');

      if(!user) res.status(401).json({message: "Invalid Email or Password!"});

      const isMatch = await user.matchPassword(password);

      if(!isMatch) return res.status(401).json({message: "Invalid Email or Password!"});

      const token = user.generateToken();

      res.cookie("token", token);
      
      res.status(200).json({message: "User logged in successfully", user, token});

}

export const getUserProfile = async(req,res,next) => {
    const user = req.user;
    res.status(200).json({message: "User profile fetched successfully", user});
}

export const logoutUser = async(req,res,next) => {
    res.clearCookie("token");

    let token;
    if(req.cookies.token){
        token = req.cookies.token;
    }else{
        token = req.headers.authorization.split(" ")[ 1 ] || req.cookies.token;
    }
    
    await blacklistTokenModel.create({token});
    
    res.status(200).json({message: "User logged out successfully!"});
}