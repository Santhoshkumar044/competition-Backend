import { scheduleVenueFreeingJob } from '../utils/scheduleJobs.js';

export async function listVenues(req, res) {
  try {
    // ✅ Access Venue model directly from req.models
    const Venue = req.models.Venue;

    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function bookVenue(req, res) {
  const { eventId, roomnumber, startTime, endTime } = req.body;
  const io = req.io;

  // ✅ Basic validation
  if (!eventId || !roomnumber || !startTime || !endTime) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    // ✅ Use models directly from req.models
    const Venue = req.models.Venue;
    const Event = req.models.Event;

    // Find venue by roomnumber
    const venue = await Venue.findOne({ roomnumber: roomnumber.trim().toLowerCase() });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    const conflictingBooking = await Event.findOne({
      'venueDetails.roomnumber': roomnumber,
         startTime: { $lt: new Date(endTime) } , 
         endTime: { $gt: new Date(startTime)},
        });
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Venue already booked for the selected time slot' });
    }

    // Emit temporary occupied status
    io.emit('venueStatusChanged', {
      roomnumber: venue.roomnumber.toString(),
      newStatus: 'occupied',
    });

    // Update event with booking details
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        venueDetails: {
          venueId: venue._id.toString(),
          roomnumber: venue.roomnumber,
          capacity: venue.capacity,
          location: venue.location,
        },
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      { new: true }
    );

    if (!updatedEvent) {
      // Revert emitted status
      io.emit('venueStatusChanged', {
        venueId: venue.roomnumber.toString(),
        newStatus: 'free',
      });
      return res.status(404).json({ message: 'Event not found' });
    }

    // Schedule job to emit venue availability later
    scheduleVenueFreeingJob(updatedEvent.endTime, venue.roomnumber, io);

    res.json({
      message: 'Venue booked and event updated successfully',
      event: updatedEvent,
      venue,
    });

  } catch (error) {
    console.error('Error booking venue:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}