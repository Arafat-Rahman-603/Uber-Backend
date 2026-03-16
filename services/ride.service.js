import Ride from "../models/ride.model.js";
import { getDistanceTime } from "./map.service.js";
import crypto from "crypto";

const PRICING_RULES = {
  auto: {
    baseFare: 30,
    perKm: 10,
    perMin: 1.5,
  },
  car: {
    baseFare: 50,
    perKm: 15,
    perMin: 2,
  },
  bike: {
    baseFare: 20,
    perKm: 8,
    perMin: 1,
  },
};

const calculateModePrice = (distance, duration, mode) => {
  const rules = PRICING_RULES[mode];
  const distanceInKm = distance / 1000;
  const durationInMin = duration / 60;
  const price =
    rules.baseFare + distanceInKm * rules.perKm + durationInMin * rules.perMin;
  return Math.round(price);
};

export const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  const { distance, duration } = await getDistanceTime(pickup, destination);

  const autoPrice = calculateModePrice(distance, duration, "auto");
  const carPrice = calculateModePrice(distance, duration, "car");
  const bikePrice = calculateModePrice(distance, duration, "bike");

  return {
    distance,
    duration,
    prices: {
      auto: autoPrice,
      car: carPrice,
      bike: bikePrice
    }
  };
};

export const createRide = async (rideData) => {
  console.log("CreaterideData", rideData);
  const { pickupLocation, dropoffLocation, vehicleType = "car" } = rideData;
  const { distance, duration } = await getDistanceTime(
    pickupLocation,
    dropoffLocation,
  );
 
  const autoPrice = calculateModePrice(distance, duration, "auto");
  const carPrice = calculateModePrice(distance, duration, "car");
  const bikePrice = calculateModePrice(distance, duration, "bike");

  const selectedPrice =
    vehicleType === "auto"
      ? autoPrice
      : vehicleType === "bike"
        ? bikePrice
        : carPrice;

  const ride = new Ride({
    ...rideData,
    user: rideData.userId,
    distance,
    duration,
    pickupLocation,
    dropoffLocation,
    price: {
      auto: autoPrice,
      car: carPrice,
      bike: bikePrice,
      selected: selectedPrice,
    },
    otp: generateOTP(),
  });
  console.log("ride", ride);
  await ride.save();
  return {
    ride,
    prices: {
      auto: autoPrice,
      car: carPrice,
      bike: bikePrice,
    },
  };
};

export const generateOTP = () => {
  const min = 100000; // smallest 6-digit number
  const max = 999999; // largest 6-digit number

  const otp = crypto.randomInt(min, max + 1); // secure random integer
  return otp.toString();
};