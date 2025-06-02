import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema({
  title: {type: String,required: true},
  description:{type: String},
  collegeName:{type: String},
  venue:{type: String},
  startDateTime:{type: Date},
  endDateTime:{type: Date},
  isRegistrationOpen:{type: Boolean,default: true},

}, { timestamps: true });

export default mongoose.model('Event', eventSchema);