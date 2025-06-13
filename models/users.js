import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['student', 'host'], default: "student" },
  isVerified: { type: Boolean, default: false },
}, { 
  timestamps: true,
  collection : 'users'
 });

export default function createUserModel(connection) {
  return connection.model('User', userSchema);
}
