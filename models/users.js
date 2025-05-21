import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
  role: { type: String, enum: ['student', 'host'], default: "student" },
  RegisterNo :{type:String,unique:true,sparse : true,required:false},
  department: { type: String },
  yearOfStudy: { type: String },
  collegeName: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema)
