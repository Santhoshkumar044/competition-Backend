import mongoose from 'mongoose';

const competitionParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  RegNo: { type: String, required: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  email: { type: String, required: true },
  competitionTitle: { type: String, required: true },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  professorUpdated: { type: Boolean, default: true },
}, { timestamps: true,
     collection:'competitionconfirmations'
 });

// prevent duplicates for same competition/profile
competitionParticipantSchema.index({ competitionId: 1, profileId: 1 }, { unique: true });

export default function createCompetitionConfirmationModel(db) {
  return db.models.CompetitionConfirmation || db.model('CompetitionConfirmation', competitionParticipantSchema);
}