import { check } from "express-validator";

export const registerRiderValidation = [
  check("fullName.firstName").notEmpty().withMessage("First name is required"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("vehicle.vehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required"),
  check("vehicle.vehicleNumber")
    .notEmpty()
    .withMessage("Vehicle number is required"),
  check("vehicle.color")
    .notEmpty()
    .withMessage("Vehicle color is required"),
  check("vehicle.capacity")
    .notEmpty()
    .withMessage("Vehicle capacity is required"),
];

export const loginRiderValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
