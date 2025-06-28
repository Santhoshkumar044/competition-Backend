import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  collegeName: String,
  venueDetails: {
    venueId: { type: String, required: false },
    name: String,
    capacity: Number,
    location: String,
  },
  startTime: Date,
  endTime: Date,
  EventDate: Date
});

export default function createEventModel(db) {
  return db.models.Event || db.model('Event', eventSchema);
}