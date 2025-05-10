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

module.exports = { registerUser };
