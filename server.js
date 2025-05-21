import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
const app = express();

dotenv.config();

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

 