const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authControllers");
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Sign Up Route
router.post("/signup", registerUser);

// Sign In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error during sign-in:', err); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
