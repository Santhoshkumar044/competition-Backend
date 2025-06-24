export const createCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const newCompetition = new Competition({
      ...req.body,
      source: 'manual'
    });

    await newCompetition.save();
    res.status(201).json(newCompetition);
  } catch (err) {
    console.error('❌ Error creating competition:', err.message);
    res.status(500).send('Server Error');
  }
};

export const getCompetitions = async (req, res) => {
  try {
    const Competition = req.models.Competition;
    const filter = {};

    // Show only approved competitions to students
    if (!req.user || req.user.role === 'student') {
      filter.status = 'approved';
    }

    // Filter by source (e.g., ?source=manual or scraped)
    if (req.query.source) {
      filter.source = req.query.source;
    }

    const competitions = await Competition.find(filter).sort({ createdAt: -1 });

    res.json(competitions);
  } catch (err) {
    console.error('❌ Error fetching competitions:', err);
    res.status(500).send('Server Error');
  }
};

export const getCompetitionById = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    const today = new Date();
    const endDate = new Date(competition.endDate || today);
    const diff = Math.max(Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)), 0);

    res.json({
      ...competition.toObject(),
      daysLeft: `${diff} days`
    });
  } catch (err) {
    console.error('❌ Error fetching competition by ID:', err);
    res.status(500).send('Server Error');
  }
};

export const updateCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    if (competition.source !== 'manual') {
      return res.status(403).json({ msg: 'You can only edit competitions created manually' });
    }

    const updated = await Competition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating competition:', err);
    res.status(500).send('Server Error');
  }
};

export const deleteCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    if (competition.source !== 'manual') {
      return res.status(403).json({ msg: 'You can only delete competitions created manually' });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Competition removed' });
  } catch (err) {
    console.error('❌ Error deleting competition:', err);
    res.status(500).send('Server Error');
  }
};

// ✅ Approve scraped competition
export const approveCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition || competition.source !== 'scraped') {
      return res.status(404).json({ msg: 'Scraped competition not found' });
    }

    competition.status = 'approved';
    await competition.save();

    res.json({ msg: 'Competition approved', competition });
  } catch (err) {
    console.error('❌ Error approving competition:', err.message);
    res.status(500).send('Server Error');
  }
};

// ✅ Reject scraped competition
export const rejectCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition || competition.source !== 'scraped') {
      return res.status(404).json({ msg: 'Scraped competition not found' });
    }

    competition.status = 'rejected';
    await competition.save();

    res.json({ msg: 'Competition rejected', competition });
  } catch (err) {
    console.error('❌ Error rejecting competition:', err.message);
    res.status(500).send('Server Error');
  }
};

// ✅ Cleanup expired pending competitions
export const cleanupExpiredPendingCompetitions = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const allPending = await Competition.find({ status: 'pending' });
    const expiredIds = [];

    for (const comp of allPending) {
      const match = comp.daysLeft?.match(/(\d+)/);
      const days = match ? parseInt(match[1]) : NaN;
      if (!isNaN(days) && days <= 0) {
        expiredIds.push(comp._id);
      }
    }

    if (expiredIds.length > 0) {
      await Competition.deleteMany({ _id: { $in: expiredIds } });
    }

    res.json({
      msg: 'Expired pending competitions cleaned up',
      deletedCount: expiredIds.length
    });
  } catch (err) {
    console.error('❌ Error cleaning expired competitions:', err.message);
    res.status(500).send('Server Error');
  }
};