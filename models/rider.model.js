import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const riderSchema = new mongoose.Schema({
          fullName: {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    
    soketId:{
        type: String,
    },

    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },

    vehicle:{
        vehicleType:{
            type: String,
            enum: ["bike", "car", "scooter"],
            required: true,
        },
        vehicleNumber:{
            type: String,
            required: true,
        },
        color:{
            type: String,
            required: true,
        },
        capacity:{
            type: Number,
            required: true,
        }
    },

    location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
    }
  },

  // Ride history embedded for fast dashboard reads
  completedRides: [
    {
      rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
      pickupLocation: { type: String },
      dropoffLocation: { type: String },
      price: { type: Number, default: 0 },
      vehicleType: { type: String },
      distance: { type: Number },
      completedAt: { type: Date, default: Date.now },
    }
  ],

  totalEarnings: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },


});

riderSchema.index({ location: "2dsphere" });

riderSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

riderSchema.methods.generateToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{expiresIn: "7d"});
}

riderSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 12);
}

const riderModel = mongoose.model("rider", riderSchema);


export default riderModel;