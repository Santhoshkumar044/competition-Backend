import Competition from '../models/competition.js';

export const createCompetition = async (req, res) => {
  try {
    const newCompetition = new Competition({
      ...req.body,
      source: 'manual' // Add a 'source' field to mark as manually created
    });

    await newCompetition.save();
    res.status(201).json(newCompetition);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getCompetitions = async (req, res) => {
  try {
    // Optionally filter competitions by source if provided in query
    const filter = req.query.source ? { source: req.query.source } : {};
    const competitions = await Competition.find(filter).sort({ createdAt: -1 }); // Allow filtering by source
    res.json(competitions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

export const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    const today = new Date();
    const endDate = new Date(competition.endDate);
    const diff = Math.max(Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)), 0);

    res.json({
      ...competition.toObject(),
      daysLeft: `${diff} days`
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

export const updateCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    // Block update if it's not manually created
    if (competition.source !== 'manual') {
      return res.status(403).json({ msg: 'You can only edit competitions created manually' }); // Restriction
    }

    const updated = await Competition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

export const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ msg: 'Not found' });

    // Block delete if it's not manually created
    if (competition.source !== 'manual') {
      return res.status(403).json({ msg: 'You can only delete competitions created manually' }); // Restriction
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Competition removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
