export const createCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const newCompetition = new Competition({
      ...req.body,
      status: 'approved',
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

    if (!req.user || req.user.role === 'student') {
      // 👨‍🎓 Students only see approved
      filter.status = 'approved';
    } else if (req.user.role === 'host') {
      // 👩‍💼 Hosts see only pending and approved
      filter.status = { $in: ['pending', 'approved'] };
    }
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
export const rejectOrDeleteCompetition = async (req, res) => {
  try {
    const Competition = req.models.Competition;

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Competition not found' });

    if (competition.source === 'manual') {
      await Competition.findByIdAndDelete(req.params.id);
      return res.json({ msg: 'Manual competition deleted' });
    }

    if (competition.source === 'scraped') {
      competition.status = 'rejected';
      await competition.save();
      return res.json({ msg: 'Scraped competition rejected', competition });
    }

    return res.status(400).json({ msg: 'Unknown competition source' });
  } catch (err) {
    console.error('❌ Error processing competition:', err.message);
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

export const getApprovedCompetitions = async (req, res) => {
  try {
    const competitions = await req.models.Competition.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(6);

    const enriched = competitions.map(comp => {
      return {
        ...comp.toObject(),
        location: comp.location || comp.venue || comp.organiser || 'Unknown',
        daysLeftText: comp.daysLeftText || (comp.daysLeft !== undefined ? `${comp.daysLeft} days` : 'Unknown'),
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ getApprovedCompetitions failed:", err);
    res.status(500).json({ error: err.message || 'Server Error' });
  }
};

