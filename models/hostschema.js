import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema({
  host_id: { type: String, required: true },
  hostname: { type: String, required: true },
  dept: { type: String },
  email: { type: String, required: true }
}, { timestamps: true,
     collection:'hosts'
 });

export default function createHostModel(db) {
  // Avoid model overwrite error in watch mode
  return db.models.Host || db.model('Host', hostSchema);
}
