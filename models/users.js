import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true},
<<<<<<< HEAD
  role: { type: String, enum: ['student', 'host'], default: "student" },
  RegisterNo :{type:String,unique:true,sparse : true,required:false},
=======
  role: { type: String, enum: ['student', 'host'], default: null },
  RegisterNo :{type:String,unique:true,sparse : true,required : false},
>>>>>>> 2a6f1dae9eb3449870eb9b7c6c39702faec8edd7
  department: { type: String },
  yearOfStudy: { type: String },
  collegeName: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema)
