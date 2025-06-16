import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB,connectVenueDB } from './config/db.js';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import configurePassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import hostRoutes from './routes/hostRoutes.js';
import competitionRoutes from './routes/manualCompetitionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import profileRoute from './routes/profileRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import confirmRegister from './routes/confirmationRoutes.js';
import { setupSocket } from './sockets.io/socketHandler.js';
import initModels from './models/index.js';
import { CompetitionService } from './services/competitionService.js';
import { ScrapingScheduler } from './services/scrapingScheduler.js';
import { ScraperController } from './controllers/scraperController.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

//Database connection function
async function initializeDatabase() {
  try {
    await connectDB(); 
    const venueDb = await connectVenueDB(); 

    app.locals.venueDb = venueDb; // Store it globally


    console.log('✅ Main DB ID:', mongoose.connection.id);
    console.log('✅ Venue DB ID:', venueDb.id);

    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
}

async function startServer() {
  if (!await initializeDatabase()) {
    process.exit(1);
  }

  //Initialize models
  app.locals.models = initModels();
  console.log('✅ Models Initialized');

  app.use((req, res, next) => {
    req.models = app.locals.models; 
    next();
  });
  
  if (!app.locals.models.User || !app.locals.models.Host) {
    throw new Error('Critical models (User/Host) not found!');
  }

  const competitionService = new CompetitionService(app.locals.models);
  const scraperController = new ScraperController(competitionService);
  const scrapingScheduler = new ScrapingScheduler(competitionService);

  // Store services in app.locals
  app.locals.services = {
    competitionService,
    scraperController
  };

  // Middleware that can be setup early
  app.use((req, res, next) => {
    req.io = io; 
    next();
  });

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  app.use(express.json());

  //Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
  }));

  //Authentication
  configurePassport(app);
  app.use(passport.initialize());
  app.use(passport.session());

  //Routes
  app.use('/', authRoutes);
  app.use('/api/host', hostRoutes);
  app.use('/api/competitions', competitionRoutes);
  app.use('/api', eventRoutes);
  app.use('/api/profile', profileRoute);
  app.use('/api/competition', confirmRegister);
  app.use('/api/venue', venueRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/stats',statsRoutes);
  // Add new scrape route
  app.get('/api/scrape', (req, res) => 
    scraperController.scrapeAllSourcesHandler(req, res)
  );

  // Health Check
  app.get('/', (req, res) => {
    res.send('server is ready');
  });

  // Socket.IO Initialization
  setupSocket(io);
  
  // Start scraping scheduler
  scrapingScheduler.start();

  app.use((err, req, res, next) => {
    console.error('⚠ Server Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  process.on('SIGTERM', () => {
    scrapingScheduler.stop();
    server.close();
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Socket.IO: ws://localhost:${PORT}/socket.io/`);
  });
}

startServer().catch(err => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});