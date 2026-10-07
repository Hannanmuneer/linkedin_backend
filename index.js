require('dotenv').config(); 
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const path = require("path");
const { connecttodb, usernotemodel } = require('./models/users');

const app = express();

const cors = require('cors');

app.use(cors(
    {
  origin: process.env.FRONTEND_URL,
  credentials: true
}
));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connecttodb();

app.get('/', (req, res) => {
  res.send('Welcome to the User Authentication API');
});

app.post('/create', async (req, res) => {
  try {
    let { firstname, lastname, email, password, age } = req.body;

    if (!firstname || !email || !password) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    let existingUser = await usernotemodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    let saltrond = 10;
    let encryptedPassword = await bcrypt.hash(password, saltrond);

    let newUser = await usernotemodel.create({
      firstname,
      lastname,
      email,
      password: encryptedPassword,
      age
    });

    
    let token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your_fallback_secret_key',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, { httpOnly: true });

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        age: newUser.age
      }
    });

  } catch (error) {
    console.error("User Creation Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


app.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await usernotemodel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

   
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    
    res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
});