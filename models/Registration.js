const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamName: { type: String },
  ProbId: {type:String , required:true},//problem staement id 
  Photoproof : {type:StingBuffer},
  members: [{
    name: String,
    email: String
  }],
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);

