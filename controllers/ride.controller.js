import { createRide } from "../services/ride.service.js";
import {
  getNearbyRiders,
  gateAddressCordinate,
} from "../services/map.service.js";
import { sendMessageToSocketId } from "../socket.js";
import Ride from "../models/ride.model.js";
import riderModel from "../models/rider.model.js";

export const createRideController = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType, orderId, signature } =
      req.body;

    if (!pickupLocation || !dropoffLocation) {
      return res
        .status(400)
        .json({ message: "pickupLocation and dropoffLocation are required" });
    }

    const rideData = {
      ...req.body,
      userId: req.user ? req.user._id : req.body.userId,
      orderId,
      signature,
      pickupLocation,
      dropoffLocation,
      vehicleType,
    };

    console.log(rideData);

    const result = await createRide(rideData);

    // Find nearby riders and determine which vehicle types are available
    const pickUpCordinate = await gateAddressCordinate(pickupLocation);

    const riderInRadius = await getNearbyRiders(
      pickUpCordinate.lat,
      pickUpCordinate.lng,
      5000,
    );

    // Build availability map based on nearby riders' vehicle types
    const availableVehicles = {
      car: false,
      bike: false,
      auto: false,
    };

    riderInRadius.forEach((rider) => {
      const type = rider.vehicle?.vehicleType;
      if (type === "car") availableVehicles.car = true;
      if (type === "bike") availableVehicles.bike = true;
      if (type === "scooter" || type === "auto") availableVehicles.auto = true;
    });

    console.log("availableVehicles", availableVehicles);

    // Do NOT emit ride-request here — wait for user to confirm
    return res.status(201).json({ ...result, availableVehicles });
  } catch (error) {
    console.error("Error creating ride:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to create ride" });
    }
  }
};

export const confirmRideController = async (req, res) => {
  try {
    const { rideId, vehicleType } = req.body;

    if (!rideId || !vehicleType) {
      return res
        .status(400)
        .json({ message: "rideId and vehicleType are required" });
    }

    // Update the ride with the confirmed vehicle type and selected price
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Update selected price based on confirmed vehicle type
    const selectedPrice =
      vehicleType === "auto"
        ? ride.price.auto
        : vehicleType === "bike"
          ? ride.price.bike
          : ride.price.car;

    ride.vehicleType = vehicleType;
    ride.price.selected = selectedPrice;
    ride.markModified('price');
    ride.status = "confirmed";
    await ride.save();

    // Re-fetch ride with populated user data
    const rideWithUser = await Ride.findById(rideId).populate("user");

    // Find nearby riders with matching vehicle type
    const pickUpCordinate = await gateAddressCordinate(ride.pickupLocation);

    const riderInRadius = await getNearbyRiders(
      pickUpCordinate.lat,
      pickUpCordinate.lng,
      5000,
    );

    // Map frontend vehicle types to rider model vehicle types
    const matchTypes =
      vehicleType === "auto" ? ["scooter", "auto"] : [vehicleType];

    // Emit ride-request only to riders with matching vehicle type
    let notifiedCount = 0;
    riderInRadius.forEach((rider) => {
      const riderType = rider.vehicle?.vehicleType;
      if (rider.soketId && matchTypes.includes(riderType)) {
        sendMessageToSocketId(rider.soketId, {
          event: "ride-request",
          data: rideWithUser,
        });
        notifiedCount++;
      }
    });

    console.log(`Ride confirmed. Notified ${notifiedCount} riders.`);

    return res
      .status(200)
      .json({ message: "Ride confirmed", notifiedRiders: notifiedCount });
  } catch (error) {
    console.error("Error confirming ride:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to confirm ride" });
    }
  }
};

export const acceptRideController = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ message: "rideId is required" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "confirmed") {
      return res.status(400).json({ message: "Ride is not available for acceptance" });
    }

    ride.status = "accepted";
    ride.rider = req.rider._id;
    await ride.save();

    // Populate user and rider for sending comprehensive data, and include OTP for the user via select
    const rideWithUserAndRider = await Ride.findById(rideId)
      .select('+otp')
      .populate("user")
      .populate("rider");

    // Notify user that ride is accepted
    if (rideWithUserAndRider.user && rideWithUserAndRider.user.soketId) {
      sendMessageToSocketId(rideWithUserAndRider.user.soketId, {
        event: "ride-accepted",
        data: rideWithUserAndRider,
      });
    }

    return res.status(200).json(rideWithUserAndRider);
  } catch (error) {
    console.error("Error accepting ride:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to accept ride" });
    }
  }
};

export const startRideController = async (req, res) => {
  try {
    const { rideId, otp } = req.body;

    if (!rideId || !otp) {
      return res.status(400).json({ message: "rideId and otp are required" });
    }

    const ride = await Ride.findById(rideId).select('+otp').populate('user rider');

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({ message: "Ride not accepted yet" });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    ride.status = "ongoing";
    await ride.save();

    if (ride.user && ride.user.soketId) {
      sendMessageToSocketId(ride.user.soketId, {
        event: "ride-started",
        data: ride,
      });
    }

    return res.status(200).json(ride);
  } catch (error) {
    console.error("Error starting ride:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to start ride" });
    }
  }
};

export const endRideController = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ message: "rideId is required" });
    }

    const ride = await Ride.findById(rideId).populate('user rider');

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "ongoing") {
      return res.status(400).json({ message: "Ride is not ongoing" });
    }

    ride.status = "completed";
    await ride.save();

    // Embed completed ride into the rider's history and update counters
    if (ride.rider) {
      const ridePrice = ride.price?.selected ? parseFloat(ride.price.selected) : 0;
      const riderId = ride.rider._id || ride.rider;
      await riderModel.findByIdAndUpdate(riderId, {
        $push: {
          completedRides: {
            rideId: ride._id,
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            price: ridePrice,
            vehicleType: ride.vehicleType,
            distance: ride.distance,
            completedAt: new Date(),
          }
        },
        $inc: {
          totalEarnings: ridePrice,
          totalRides: 1,
        }
      });
    }

    // Notify user that the ride has ended
    if (ride.user && ride.user.soketId) {
      sendMessageToSocketId(ride.user.soketId, {
        event: "ride-ended",
        data: ride,
      });
    }

    return res.status(200).json(ride);
  } catch (error) {
    console.error("Error ending ride:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to end ride" });
    }
  }
};

export const payRideController = async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ message: "rideId is required" });
    }

    const ride = await Ride.findById(rideId).populate('user rider');

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Ride is not completed yet" });
    }

    // You could update a payment status field here if the model supported it
    // For now we just sync the event to the rider.

    // Notify rider that the payment has been received
    if (ride.rider && ride.rider.soketId) {
      sendMessageToSocketId(ride.rider.soketId, {
        event: "payment-received",
        data: ride,
      });
    }

    return res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    console.error("Error processing payment:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to process payment" });
    }
  }
};

