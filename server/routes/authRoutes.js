const express = require("express");
const router = express.Router();
const { registerUser, signInUser  } = require("../controllers/authControllers");

// Sign Up Route
router.post("/signup", registerUser);

// Sign In Route
router.post('/signin', signInUser);

module.exports = router;
