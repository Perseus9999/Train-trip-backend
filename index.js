import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from 'bcrypt'
import { User } from "./models/User.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const DISTRIBUSION_API_KEY = process.env.DISTRIBUSION_API_KEY || ""
// Allow requests from your Next.js frontend
app.use(cors({
  origin: "http://localhost:3000",   // your frontend origin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Api-Key"],
  headers: ["Content-Type", "application/json"]
}));

app.use(express.json());

app.get("/api/connections", async (req, res) => {
  try {
    const { departure, arrival, departureDate, returnDate, passengers_count, passengers_max_age } = req.query;
    console.log("travellers => ", passengers_count + passengers_max_age);
    const params = new URLSearchParams({
      "locale": "en",
      "currency": "EUR",
      'departure_stations[]': departure || "GBLONLHB",
      'arrival_stations[]': arrival || "GBLONLPB",
      "departure_date": departureDate || "",
      "return_date": returnDate || "",
      "passengers[][pax]": passengers_count || "1",
      "passengers[][max_age]": passengers_max_age || "59"
    });

    console.log("Params => ", params.toString())

    //Request sample
    //'https://api.demo.distribusion.com/retailers/v4/connections/find?locale=en&currency=EUR&departure_stations[]=GBLONLPB&arrival_stations[]=GBLONLHB&departure_date=2025-09-03&return_date=2025-09-06&passengers[][pax]=1&passengers[][max_age]=59' \


    const response = await fetch(
      `https://api.demo.distribusion.com/retailers/v4/connections/find?${params.toString()}`,
      {
        headers: {
          "Accept": "application/json",
          "Api-Key": DISTRIBUSION_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Distribusion" });
    }

    // Real Data response
    const data = await response.json();
    res.json(data);

    //Test Data response
    // res.json(testRes)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  console.log("Register data => ", req.body);
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phoneNumber, 
      birthDate, 
      idType, 
      idNumber, 
      countryOfResidence, 
      loyaltyCardNumber 
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      birthDate,
      idType, 
      idNumber, 
      countryOfResidence, 
      loyaltyCardNumber 
    });

    console.log("New User => ", newUser);

    const saveResult = await newUser.save();
    console.log("Save Result => ", saveResult);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post ("/login", async (req, res) => {
  
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful", userId: user._id});
  } catch (error) {
    res.status(500).json({ error: "Internal server error"});
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
