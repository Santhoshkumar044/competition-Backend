const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'host'], default: null },
  RegisterNo :{type:String,unique:true},
  department: { type: String },
  yearOfStudy: { type: String },
  collegeName: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);


