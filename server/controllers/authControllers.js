const jwt = require('jsonwebtoken');
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ msg: "Please fill in all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ msg: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log("✅ New user created:", user);  // Log in backend console
    res.status(201).json({ msg: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const signInUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,  // Prevents client-side access
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',  // Use true in production for https
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });

    res.status(200).json({ message: 'Login successful', userId: existingUser._id });
  } catch (err) {
    console.error('Error during sign-in:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, signInUser };
