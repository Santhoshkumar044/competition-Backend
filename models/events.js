const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['event','competition'], required: true },
  posterImage: { data: Buffer ,contentType : String}, 
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeName: { type: String },
  venue: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  isRegistrationOpen: { type: Boolean, default: true },
  maxParticipants: { type: Number },
}, { timestamps: true });  

module.exports = mongoose.model('Event', eventSchema);

