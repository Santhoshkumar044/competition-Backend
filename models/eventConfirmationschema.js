import mongoose from 'mongoose';

const eventParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  RegNo: { type: String, required: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  title: { type: String, required: true },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'event',
    required: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
}, { timestamps: true });

// prevent duplicates for same event/profile
eventParticipantSchema.index({ eventId: 1, profileId: 1 }, { unique: true });

export default function createEventConfirmationModel(db) {
  return db.models.eventConfirmation || db.model('eventConfirmation', eventParticipantSchema);
}