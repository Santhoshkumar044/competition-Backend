// import mongoose from 'mongoose';
// import createview from '../models/viewschema.js';

// const View = createview(mongoose); // Initialize model

// /**
//  * Mark a competition as viewed by the user
//  */
// export async function markCompetitionViewed(req, res) {
//   const { email, competitionId } = req.body;

//   try {
//     let activity = await View.findOne({ email });
//     if (!activity) {
//       activity = new View({ email, viewedCompetitions: [], confirmedCompetitions: [] });
//     }

//     const alreadyViewed = activity.viewedCompetitions.find(
//       (entry) => entry.competitionId === competitionId
//     );

//     if (!alreadyViewed) {
//       activity.viewedCompetitions.push({
//         competitionId,
//         viewedAt: new Date(),
//       });
//       await activity.save();
//     }

//     return res.status(200).json({ message: "Competition marked as viewed" });
//   } catch (error) {
//     console.error("❌ Controller error:", error);
//     return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
//   }
// }


// /**
//  * Mark a competition as confirmed by the user
//  */
// export async function confirmCompetition(req, res) {
//   try {
//     const { email, competitionId } = req.body;

//     const user = await View.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const alreadyConfirmed = user.confirmedCompetitions.includes(competitionId);
//     if (!alreadyConfirmed) {
//       user.confirmedCompetitions.push(competitionId);
//       await user.save();
//     }

//     return res.status(200).json({ message: 'Competition confirmed' });
//   } catch (error) {
//     console.error("❌ Error in confirmCompetition:", error);
//     return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
//   }
// }


// /**
//  * Get competitions viewed but not confirmed by the user
//  */
// export async function getUnconfirmedViewed(req, res) {
//   try {
//     const { email } = req.params;

//     const user = await View.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const unconfirmed = user.viewedCompetitions.filter(
//       (entry) => !user.confirmedCompetitions.includes(entry.competitionId)
//     );

//     return res.status(200).json(unconfirmed);
//   } catch (error) {
//     console.error("❌ Error in getUnconfirmedViewed:", error);
//     return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
//   }
// }
/**
 * ✅ CHANGED: Access View model from req.models instead of importing directly
 * Mark a competition as viewed by the user
 */
export async function markCompetitionViewed(req, res) {
  const View = req.models.View; // ✅ CHANGED: Using model from req.models
  const { email, competitionId } = req.body;

  try {
    let activity = await View.findOne({ email });
    if (!activity) {
      activity = new View({ email, viewedCompetitions: [], confirmedCompetitions: [] });
    }

    const alreadyViewed = activity.viewedCompetitions.find(
      (entry) => entry.competitionId === competitionId
    );

    if (!alreadyViewed) {
      activity.viewedCompetitions.push({
        competitionId,
        viewedAt: new Date(),
      });
      await activity.save();
    }

    return res.status(200).json({ message: "Competition marked as viewed" });
  } catch (error) {
    console.error("❌ Controller error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
  }
}

/**
 * ✅ CHANGED: Access View model from req.models
 * Mark a competition as confirmed by the user
 */
export async function confirmCompetition(req, res) {
  const View = req.models.View; // ✅ CHANGED

  try {
    const { email, competitionId } = req.body;

    const user = await View.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyConfirmed = user.confirmedCompetitions.includes(competitionId);
    if (!alreadyConfirmed) {
      user.confirmedCompetitions.push(competitionId);
      await user.save();
    }

    return res.status(200).json({ message: 'Competition confirmed' });
  } catch (error) {
    console.error("❌ Error in confirmCompetition:", error);
    return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
  }
}

/**
 * ✅ CHANGED: Access View model from req.models
 * Get competitions viewed but not confirmed by the user
 */
export async function getUnconfirmedViewed(req, res) {
  const View = req.models.View; // ✅ CHANGED

  try {
    const { email } = req.params;

    const user = await View.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const unconfirmed = user.viewedCompetitions.filter(
      (entry) => !user.confirmedCompetitions.includes(entry.competitionId)
    );

    return res.status(200).json(unconfirmed);
  } catch (error) {
    console.error("❌ Error in getUnconfirmedViewed:", error);
    return res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
  }
}
