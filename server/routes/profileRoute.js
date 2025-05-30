const express = require('express');
const multer = require("multer");
const path = require("path");
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const authMiddleware = require('../middleware/authMiddleware');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique name
  }
});

const upload = multer({ storage: storage });
// Route
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      fullName,
      dob,
      email,
      contactNumber,
      degreeProgram,
      fieldOfStudy,
      university,
      cgpa,
      graduationYear,
      skills,
      careerGoals,
      linkedin,
      github,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const newProfile = new StudentProfile({
      fullName,
      dob,
      email,
      contactNumber,
      degreeProgram,
      fieldOfStudy,
      university,
      cgpa,
      graduationYear,
      skills,
      careerGoals,
      linkedin,
      github,
      image,
    });

    await newProfile.save();
    res.status(201).json({ message: 'Profile created successfully', profile: newProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
