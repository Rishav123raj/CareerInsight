const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoute");
const cors = require("cors");
const cookieParser = require('cookie-parser'); 
const session = require("express-session");
const employabilityRoutes = require('./routes/employabilityRoutes');

dotenv.config();
connectDB();
const app = express();

// ✅ Setup session middleware
app.use(session({
  secret: process.env.JWT_SECRET, // replace with strong secret
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true only if HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(express.json());
app.use(cors());
app.use(cookieParser());  
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use('/api/profile', profileRoutes);
app.use('/api/features', employabilityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
