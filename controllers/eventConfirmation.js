export const confirmEventRegistration = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const Profile = req.models.Profile;
    const Event = req.models.Event;
    const EventParticipant = req.models.EventParticipant;

    const user = await Profile.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const exists = await EventParticipant.findOne({
      eventId: event._id,
      profileId: user._id,
    });

    if (exists) {
      return res.status(409).json({
        error: '⚠ User has already been added to this event',
      });
    }

    const participant = new EventParticipant({
      name: user.fullName,
      RegNo: user.RegNo,
      department: user.Dept,
      batch: user.batch,
      email: user.email,
      number:user.number,
      title: event.title,
      eventId: event._id,
      profileId: user._id,
      professorUpdated: true,
    });

    await participant.save();

    res.status(201).json({
      message: '✅ Participant added successfully to confirmation list',
      participant,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: '⚠ User has already been added to this event',
      });
    }

    console.error('❌ Error confirming event participation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
