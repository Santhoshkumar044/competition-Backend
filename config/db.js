import mongoose from "mongoose";

export const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongo Conected : ${conn.connection.host}`)
    }catch(error){
        console.error(`Error:${error.message}`);
        process.exit(1); 
    } 
}

export async function connectVenueDB() {
  try {
    const venueDb = await mongoose.createConnection(process.env.MONGO_URI2, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to Venue DB: ${venueDb.client.s.url}`);
    return venueDb;
  } catch (error) {
    console.error("❌ Failed to connect Venue DB", error);
    process.exit(1);
  }
}