import mongoose from 'mongoose';
import Profile from '../models/Profileschema.js';

// POST /profile/create
export const createProfile = async (req, res) => {
  try {
    const { fullName, rollNo, email, Dept, batch, Gender, domain, bio } = req.body;

    const newProfile = new Profile({ fullName, rollNo, email, Dept, batch, Gender, domain, bio });
    const savedProfile = await newProfile.save();

    res.status(201).json({
      message: 'Profile created successfully',
      profile: savedProfile,
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Server error while creating profile' });
  }
};

// PUT /profile/update/:id
export const updateProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const { fullName, rollNo, email, Dept, batch, Gender, domain, bio } = req.body;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      {
        $set: { fullName, rollNo, email, Dept, batch, Gender, domain, bio },
      },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};
