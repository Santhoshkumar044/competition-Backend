import 'dotenv/config';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import scraperRoutes from './routes/scrapingRoutes.js';
import { startScrapingScheduler } from './services/scrapingScheduler.js';

const app = express();
dotenv.config();

// Passport configuration
configurePassport();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Required for maintaining session across Google login
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// JSON parser
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/api', scraperRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Server is ready with Google login");
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  // Start the scraping scheduler after DB connection is established
  startScrapingScheduler();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});