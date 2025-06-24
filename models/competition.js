import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  organiser: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    enum: ['Online', 'offline', 'hybrid','online','Offline'],
    default: 'online',
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  prize: {
    type: String,
    default: 'Non cash prize',
    trim: true
  },
  daysLeft: {
    type: String,
    trim: true
  },
link: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  validate: {
    validator: function(v) {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    message: props => `${props.value} is not a valid URL!`
  }
},
  source: {
    type: String,
    enum: ['manual', 'scraped'],
    default: 'scraped'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'competitions'
});

// Full-text search on title and organiser, fast filter on mode
competitionSchema.index({ title: 'text', organiser: 'text', mode: 1 });

export default function createCompetitionModel(dbConnection) {
  return dbConnection.model('Competition', competitionSchema);
}