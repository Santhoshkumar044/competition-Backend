import mongoose from 'mongoose';

const studentDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  email :{type : String , required : true},
  department: String,
  GraduationYear: String,
  RegisterNo: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.model('StudentDetails', studentDetailsSchema);

//this file is used to store the student info only