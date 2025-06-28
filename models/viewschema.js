import mongoose from 'mongoose';
const viewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  viewedCompetitions: [{
    competitionId: String,
    viewedAt: Date
  }],
  confirmedCompetitions: [String]
});3

export default function createView(dbConnection){
return dbConnection.model('View', viewSchema);
}


