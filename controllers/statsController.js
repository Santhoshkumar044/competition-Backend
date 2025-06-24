import mongoose from 'mongoose';
import createCompetitionConfirmationModel from '../models/competitionConfirmation.js';

const CompetitionConfirmation = createCompetitionConfirmationModel(mongoose);

export const getParticipantStats = async (req, res) => {
  try {
    const competitionId = req.params.id;

    // Logging before DB query
    console.log("Getting stats for competitionId:", competitionId);
    
    const participants = await CompetitionConfirmation.find({ competitionId });

    // Logging after DB query
    console.log("Participants found:", participants.length);

    if (!participants || participants.length === 0) {
      return res.status(404).json({ message: "No participants found for this competition." });
    }

    // Generate stats
    const stats = {
      department: {},
      batch: {},
      coe: {}
    };

    for (const p of participants) {
      const department = p.department || 'Unknown';
      const batch = p.batch || 'Unknown';
      const coe = p.coe || 'Unknown';
      stats.department[department] = (stats.department[department] || 0) + 1;
      stats.batch[batch] = (stats.batch[batch] || 0) + 1;
      stats.coe[coe] = (stats.coe[coe] || 0) + 1;
      
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error while generating stats." });
  }
};
