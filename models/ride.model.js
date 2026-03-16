import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    rider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'rider',
    },
    pickupLocation:{
        type:String,
        required:true,
    },
    dropoffLocation:{
        type:String,
        required:true,
    },
    distance:{
        type:Number,
        required:true,
    },
    duration:{
        type:Number,
        required:true,
    },
    price:{
        type:Object,
        required:true,
    },
    paymentId:{
        type:String,
    },
    orderId:{
        type:String,
    },
    signature:{
        type:String,
    },
    vehicleType:{
        type:String,
        enum:['bike','car','scooter','auto'],
    },
    status:{
        type:String,
        enum:['pending','confirmed','accepted','ongoing','completed','cancelled'],
        default:'pending',
    },
    otp:{
        type:String,
        select:false,
    },
  
}, { timestamps: true });

const Ride = mongoose.model('Ride',rideSchema);

export default Ride;