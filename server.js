
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: "*"
}));
app.use(express.json());

/*
  CONNECT DATABASE (VM3)
  Make sure MongoDB is running on VM3 at:
  10.0.0.95:27017
*/

mongoose.connect("mongodb://10.52.21.171:27017/ourworlds");

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log("DB connection error:", err);
});

/*  USER MODEL
  This is your database schema for storing users
*/
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String
});

/*
  REGISTER ROUTE
  - Hash password
  - Save user to MongoDB
*/
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.send("User registered successfully");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

/*
  LOGIN ROUTE
  - Find user by username
  - Compare hashed password
*/
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).send("Wrong password");
    }

    res.send("Login successful");
  } catch (err) {
    res.status(500).send("Login error");
  }
});

/*
  TEST ROUTE
*/
app.get("/", (req, res) => {
  res.send("Backend is working");
});

/*
  START SERVER
*/
app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});
