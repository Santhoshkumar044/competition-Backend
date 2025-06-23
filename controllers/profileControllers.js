// // POST /profile/create-or-update
// export const createOrUpdateProfile = async (req, res) => {
//   try {
//     const {
//       fullName,
//       RegNo,        
//       email,
//       Dept,         
//       batch,
//       Gender,
//       domain,
//       bio,
//       competitionParticipated,
//       competitionWon,
//     } = req.body;

//     const Profile = req.models.Profile;

//     // Check if a profile already exists for this user by email
//     let profile = await Profile.findOne({ email });

//     if (profile) {
//       // Profile exists → perform update
//       profile.fullName = fullName;
//       profile.RegNo = RegNo;
//       profile.Dept = Dept;
//       profile.batch = batch;
//       profile.Gender = Gender;
//       profile.domain = domain;
//       profile.bio = bio;
//       profile.competitionStats = {
//         competitionWon,
//         competitionParticipated,
//       };

//       const updatedProfile = await profile.save();
//       return res.status(200).json({
//         message: 'Profile updated successfully',
//         profile: updatedProfile,
//       });
//     } else {
//       // Profile does not exist → create new
//       const newProfile = new Profile({
//         fullName,
//         RegNo,
//         email,
//         Dept,
//         batch,
//         Gender,
//         domain,
//         bio,
//         competitionStats: {
//           competitionWon,
//           competitionParticipated,
//         },
//       });

//       const savedProfile = await newProfile.save();
//       return res.status(201).json({
//         message: 'Profile created successfully',
//         profile: savedProfile,
//       });
//     }
//   } catch (error) {
//     console.error('Error creating/updating profile:', error);
//     res.status(500).json({ error: 'Server error while processing profile' });
//   }
// };

// // GET /profile/me
// export const getMyProfile = async (req, res) => {
//   try {
//     const email = req.user?.email;

//     if (!email) {
//       return res.status(401).json({ error: 'Unauthorized: No email found in session' });
//     }

//     const Profile = req.models.Profile;

//     const profile = await Profile.findOne({ email });

//     if (!profile) {
//       return res.status(404).json({ error: 'Profile not found' });
//     }

//     res.status(200).json(profile);
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ error: 'Server error while fetching profile' });
//   }
// };
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      fullName,
      RegNo,        
      email,
      Dept,         
      batch,
      Gender,
      domain,
      bio,
      coe,
      competitionStats,
    } = req.body;

    const Profile = req.models.Profile;

    let profile = await Profile.findOne({ email });

    if (profile) {
      profile.fullName = fullName;
      profile.RegNo = RegNo;
      profile.Dept = Dept;
      profile.batch = batch;
      profile.Gender = Gender;
      profile.domain = domain;
      profile.bio = bio;
      profile.coe=coe;
      profile.competitionStats = competitionStats;

      const updatedProfile = await profile.save();
      return res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
      });
    } else {
      // Profile does not exist → create new
      const newProfile = new Profile({
        fullName,
        RegNo,
        email,
        Dept,
        batch,
        Gender,
        domain,
        bio,
        coe,
        competitionStats,
      });

      const savedProfile = await newProfile.save();
      return res.status(201).json({
        message: 'Profile created successfully',
        profile: savedProfile,
      });
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Server error while processing profile' });
  }
};

// GET /profile/me
export const getMyProfile = async (req, res) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({ error: 'Unauthorized: No email found in session' });
    }

    const Profile = req.models.Profile;

    const profile = await Profile.findOne({ email });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};
