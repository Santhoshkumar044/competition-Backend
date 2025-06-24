// // export const confirmRegistration = async (req, res) => {
// //   const { competitionId, profileId } = req.body;

// //   if (!competitionId || !profileId) {
// //     return res.status(400).json({ error: 'competitionId and profileId are required' });
// //   }

// //   try { 

// //     const Profile = req.models.Profile;
// //     const Competition = req.models.Competition;
// //     const CompetitionParticipant = req.models.CompetitionParticipant;

// //     const user = await Profile.findById(profileId);
// //     if (!user) {
// //       return res.status(404).json({ error: 'Profile not found' });
// //     }

// //     const competition = await Competition.findById(competitionId);
// //     if (!competition) {
// //       return res.status(404).json({ error: 'Competition not found' });
// //     }

// //     const participant = new CompetitionParticipant({
// //       name: user.fullName,
// //       RegNo: user.RegNo,
// //       department: user.Dept,
// //       batch: user.batch,
// //       email: user.email,
// //       competitionTitle: competition.title,
// //       competitionId: competition._id,
// //       profileId: user._id,
// //       professorUpdated: true
// //     });

// //     await participant.save();

// //     res.status(200).json({
// //       message: '✅ Participant added successfully to confirmation list',
// //       participant
// //     });

// //   } catch (error) {
// //     if (error.code === 11000) {
// //       return res.status(409).json({
// //         error: '⚠ User has already been added to this competition'
// //       });
// //     }

// //     console.error('❌ Error confirming participation:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // };
// export const confirmRegistration = async (req, res) => {
//   try {
//     const { competitionId, type, teamName, teamMembers } = req.body;

//     if (!req.user) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }
//     if (!competitionId || !type || (type === 'team' && !teamName)) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

    // // 1. Fetch the user's profile using the authenticated user's email
    // const Profile = req.models.Profile;
    // const Competition = req.models.Competition;
    // const CompetitionParticipant = req.models.CompetitionParticipant;

    // const user = await Profile.findOne({ email: req.user.email });
    // if (!user) {
    //   return res.status(404).json({ error: "Profile not found" });
    // }

//     // Fetch the competition
//     const competition = await Competition.findById(competitionId);
//     if (!competition) {
//       return res.status(404).json({ error: "Competition not found" });
//     }

//     // Check for duplicate registration
//     const exists = await CompetitionParticipant.findOne({
//       competitionId: competition._id,
//       profileId: user._id,
//     });

//     if (exists) {
//       return res.status(409).json({
//         error: '⚠ User has already been added to this competition',
//       });
//     }

//     // 4. Register the participant with your required fields
//     const participantData = {
//       name: user.fullName,         
//       RegNo: user.RegNo,           
//       department: user.Dept,       
//       batch: user.batch,           
//       email: user.email,
//       coe:user.coe,
//       competitionTitle: competition.title,
//       competitionId: competition._id,
//       profileId: user._id,
//       professorUpdated: true,      
//     };

//     if (type === 'team'){
//       participantData.teamName = teamName;
//       participantData.teamMembers = teamMembers;
//     }
//     const participant = new CompetitionParticipant(participantData);
//     await participant.save();

//     res.status(201).json({
//       message: '✅ Participant added successfully to confirmation list',
//       participant,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: '⚠ User has already been added to this competition',
//       });
//     }

//     console.error('❌ Error confirming participation:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

export const confirmRegistration = async (req, res) => {
  try {
    const { competitionId, type, teamName, teamMembers } = req.body;
    

    const Competition = req.models.Competition;
    const CompetitionParticipant = req.models.CompetitionParticipant;
    const Profile = req.models.Profile;
    const user = await Profile.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    if (!competitionId || !type || (type === 'team' && !teamName)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: "Competition not found" });
    }

    const exists = await CompetitionParticipant.findOne({
      competitionId: competition._id,
      profileId: user._id,
    });

    if (exists) {
      return res.status(409).json({ error: "⚠ User already confirmed for this competition" });
    }

    // Optional: Validate teamMembers length
    if (type === 'team') {
      if (!Array.isArray(teamMembers)) {
        return res.status(400).json({ error: "teamMembers must be an array of emails" });
      }
    }

    const participantData = {
      name: user.fullName,
      RegNo: user.RegNo,
      department: user.Dept,
      batch: user.batch,
      email: user.email,
      coe: user.coe,
      number: user.number,
      competitionTitle: competition.title,
      competitionId: competition._id,
      profileId: user._id,
      professorUpdated: true,
    };

    if (type === 'team') {
      participantData.teamName = teamName;
      participantData.teamMembers = teamMembers;
    }

    const participant = new CompetitionParticipant(participantData);
    await participant.save();

    res.status(201).json({
      message: "✅ Registration successful",
      participant,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "⚠ Already registered for this competition" });
    }

    console.error("❌ Error during confirmation:", error);
    res.status(500).json({ error: "Server error" });
  }
};
