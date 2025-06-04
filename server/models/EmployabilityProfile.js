const mongoose = require('mongoose');

const EmployabilityProfileSchema = new mongoose.Schema({
  technicalExpertise: String,
  githubLink: String,
  leetcodeLink: String,
  linkedinLink: String,
  score: Number
});

module.exports = mongoose.model('EmployabilityProfile', EmployabilityProfileSchema);
