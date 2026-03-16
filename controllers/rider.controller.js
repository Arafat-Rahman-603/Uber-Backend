import riderModel from "../models/rider.model.js";
import blacklistTokenModel from "../models/blacklistToken.model.js";
import otpModel from "../models/otp.model.js";
import { validationResult } from "express-validator";
import Ride from "../models/ride.model.js";
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

export const registerRider = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("validation errors", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { fullName, email, password, vehicle, otp } = req.body;

    if (!fullName || !email || !password || !vehicle || !otp) {
      return res.status(400).json({ message: "All fields are required including OTP" });
    }

    // Verify OTP
    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const riderExists = await riderModel.findOne({ email });

    if (riderExists) {
      return res.status(400).json({ message: "Rider already exists" });
    }

    const rider = await riderModel.create({
      fullName: {
        firstName: fullName.firstName,
        lastName: fullName.lastName,
      },
      email,
      password: await riderModel.hashPassword(password),
      vehicle: {
        vehicleType: vehicle.vehicleType,
        vehicleNumber: vehicle.vehicleNumber,
        color: vehicle.color,
        capacity: vehicle.capacity,
      },
    });

    // Clean up used OTP
    await otpModel.deleteMany({ email });

    const token = rider.generateToken();
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res
      .status(201)
      .json({ message: "User registered successfully", rider, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginRider = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const rider = await riderModel.findOne({ email }).select("+password");
    if (!rider) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await rider.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = rider.generateToken();
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.status(200).json({ token, rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  // res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (token) {
    await blacklistTokenModel.create({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }
  res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  console.log("req.rider", req.rider);
  try {
    const rider = await riderModel.findById(req.rider._id);
    res.status(200).json({ rider });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getRiderStats = async (req, res) => {
  try {
    const riderId = req.rider._id;

    const rider = await riderModel.findById(riderId).select(
      'totalEarnings totalRides completedRides'
    );

    if (!rider) return res.status(404).json({ message: "Rider not found" });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysRides = rider.completedRides.filter(
      (r) => new Date(r.completedAt) >= startOfToday
    );

    const todaysEarnings = todaysRides.reduce((sum, r) => sum + (r.price || 0), 0);

    // Last 5 completed rides for history display
    const recentRides = [...rider.completedRides]
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);

    return res.status(200).json({
      totalRides: rider.totalRides || 0,
      totalEarnings: (rider.totalEarnings || 0).toFixed(2),
      todaysRides: todaysRides.length,
      todaysEarnings: todaysEarnings.toFixed(2),
      recentRides,
    });
  } catch (error) {
    console.error("Error getting rider stats:", error);
    res.status(500).json({ message: error.message });
  }
};
