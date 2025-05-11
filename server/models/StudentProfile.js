const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
 // Personal Information
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String },

  // Academic Details
  degreeProgram: { type: String },
  fieldOfStudy: { type: String },
  university: { type: String },
  cgpa: { type: Number },
  graduationYear: { type: Number },

  // Skills & Interests
  skills: { type: String },

  // Online Presence
  linkedin: { type: String },
  github: { type: String },

  // Image (optional)
  image: { type: String }, // stores filename or path
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
