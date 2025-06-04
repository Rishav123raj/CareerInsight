const axios = require('axios');
const EmployabilityProfile = require('../models/EmployabilityProfile');

// GitHub Stats Scoring (out of 30)
const calculateGitHubScore = async (githubLink) => {
  try {
    const username = githubLink.split('github.com/')[1].split('/')[0];
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos`);
    const repos = reposRes.data;

    let totalStars = 0, totalForks = 0;
    repos.forEach(repo => {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    });

    const totalContributions = repos.length + totalStars + totalForks;

    // Normalize to 30
    const score = Math.min(30, totalContributions / 10);
    console.log(`GitHub score for ${username}: ${score}`);
    return score;
  } catch (error) {
    console.error('GitHub analysis failed:', error.message);
    return 0;
  }
};

// LeetCode Stats Scoring (out of 30)
const calculateLeetCodeScore = async (leetcodeLink) => {
  try {
    const username = leetcodeLink.split('leetcode.com/')[1].replace(/\//g, '');
    const apiUrl = `https://leetcode-stats-api.herokuapp.com/${username}`; 

    const res = await axios.get(apiUrl);
    const solved = res.data.totalSolved || 0;

    // Normalize to 30
    const score = Math.min(30, solved / 5); 
    console.log(`LeetCode score for ${username}: ${score}`);
    return score;
  } catch (error) {
    console.error('LeetCode analysis failed:', error.message);
    return 0;
  }
};


// Final Controller
exports.calculateEmployability = async (req, res) => {
  try {
    const profile = req.body;

    const githubScore = await calculateGitHubScore(profile.githubLink);
    const leetcodeScore = await calculateLeetCodeScore(profile.leetcodeLink);
    const techScore = profile.technicalExpertise ? 25 : 0;
    const linkedinScore = profile.linkedinLink.includes('linkedin.com') ? 15 : 0;

    const totalScore = Math.round(githubScore + leetcodeScore + techScore + linkedinScore);

    const newProfile = new EmployabilityProfile({ ...profile, score: totalScore });
    await newProfile.save();

    res.json({ score: totalScore });
  } catch (err) {
    console.error('Error calculating employability score:', err);
    res.status(500).json({ error: 'Error calculating score' });
  }
};
