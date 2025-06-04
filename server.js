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
import hostRoutes from './routes/hostRoutes.js';
import MongoStore from 'connect-mongo';
import competitionRoutes from './routes/manualcompetitionRoutes.js' 
import profileRoute from './routes/profileRoutes.js';

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
  store: MongoStore.create({            // Add this block
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60,            // Session TTL (14 days)
    autoRemove: 'native'               // Cleanup expired sessions
  }),
  cookie: { 
    secure: false,                     // Set to `true` 
    httpOnly: true,                   //change it after testing
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000  // Matches TTL
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// JSON parser
app.use(express.json());

// Routes
app.use('/', authRoutes); // sign in route
app.use('/api', scraperRoutes);  //scraping route
app.use('/api/host',hostRoutes);  //adding host route
app.use('/api/competitions',competitionRoutes);  //posting competitions by host
app.use('/profile',profileRoute);  //user profile creation and updation

app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});
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