import 'dotenv/config';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


const app = express();

// Passport configuration
configurePassport();
dotenv.config();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', authRoutes);
app.use('/', userRoutes);


app.use(express.json());


app.get("/",(req,res)=>{
    res.send("Server is ready");
})

const PORT = process.env.PORT || 5000; 
 console.log(process.env.MONGO_URI);
 app.listen(PORT,() =>{
    connectDB();
    console.log(`Server is running in ${PORT}`);
 })

 