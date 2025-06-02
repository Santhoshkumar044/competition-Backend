import mongoose from 'mongoose';

const hostSchema = new mongoose.Schema({
    host_id: { type: String, required: true },
    hostname: { type: String, required: true },
    dept: { type: String },
    email: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Host', hostSchema);