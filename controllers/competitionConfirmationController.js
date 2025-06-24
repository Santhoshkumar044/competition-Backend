//this is to display the competions that the user has confirmed
import mongoose from "mongoose";
import createCompetitionConfirmationModel from "../models/competitionConfirmation.js";
import createCompetitionModel from "../models/competition.js";

const CompetitionConfirmation = createCompetitionConfirmationModel(mongoose);
const Competition = createCompetitionModel(mongoose);

export async function getUserConfirmedCompetitions(req, res) {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ message: "Profile ID is required" });
    }

    const registrations = await CompetitionConfirmation.find({ profileId })
      .populate({
        path: 'competitionId',
        select: 'daysLeft link',
      })
      .lean();
    

    const formatted = registrations.map(entry => ({
      competitionTitle: entry.competitionTitle,

      registeredOn: entry.createdAt,
      professorUpdated: entry.professorUpdated,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching confirmed competitions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
