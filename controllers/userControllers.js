export const getCurrentUser = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {; // Or venueDb if needed
    const Profile = req.models.User;

    const user = await Profile.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('❌ Error fetching current user:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
