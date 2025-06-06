import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema({
  title: {type: String,required: true},
  description:{type: String},
  collegeName:{type: String},
  venue:{
    roomNumber:String,
    location: String,
    capacity: Number,
  },
  EventDate:{type:Date},
  startTime:{type:String},
  endTime:{type: String},
  isRegistrationOpen:{type: Boolean,default: true},

}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;