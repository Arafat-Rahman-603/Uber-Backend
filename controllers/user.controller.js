import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import { validationResult } from "express-validator";
import blacklistTokenModel from "../models/blacklistToken.model.js";
import { sendOtpEmail } from "../services/email.service.js";

// Generate a random 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Delete any existing OTP for this email
    await otpModel.deleteMany({ email });

    const otp = generateOtp();
    await otpModel.create({ email, otp });
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, otp } = req.body;

  if (!fullName || !email || !password || !otp) {
    return res.status(400).json({ message: "All fields are required including OTP" });
  }

  // Verify OTP
  const otpRecord = await otpModel.findOne({ email, otp });
  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const userExists = await userModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userModel.create({
    fullName: {
      firstName: fullName.firstName,
      lastName: fullName.lastName,
    },
    email,
    password: await userModel.hashPassword(password),
  });

  // Clean up used OTP
  await otpModel.deleteMany({ email });

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

      if(!user) return res.status(401).json({message: "Invalid Email or Password!"});

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