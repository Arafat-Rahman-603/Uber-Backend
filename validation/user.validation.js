import { check } from "express-validator";

export const registerUserValidation = [
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
];

export const loginUserValidation = [
  check("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
    check("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]