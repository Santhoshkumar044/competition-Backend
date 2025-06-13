import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  roomnumber: String,
  capacity: Number,
  location: String,
  status: {
  type: String,
  required: true,
  default: 'free',
},

});

export default function createVenueModel(db) {
  // Check if model is already compiled in the connection
  return db.models.Venue || db.model('Venue', venueSchema);
}