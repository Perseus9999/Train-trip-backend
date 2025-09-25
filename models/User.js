import mongoose from "mongoose";
import { mongoConnection } from "../lib/mongoose.js";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // Store hashed password
    firstName: String,
    lastName: String,
    phoneNumber: String,
    birthDate: String,
    idType: { type: String, enum: ["Passport", "ID Card", "Driving License"] },
    idNumber: String,
    countryOfResidence: String,
    loyaltyCardNumber: String,
});

export const User = mongoConnection.models.User || mongoConnection.model("User", userSchema);