import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { scheduleVenueFreeingJob } from '../utils/scheduleJobs.js';

export async function createEvent(req, res) {
  const Event = req.models.Event;
  const Venue = req.models.Venue;

  // Destructure from request body
  const { title, description, collegeName, startTime, endTime, name, EventDate } = req.body;

  if (!title || !description || !collegeName || !name || !EventDate || !startTime || !endTime) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const startDateTimeStr = `${EventDate} ${startTime}`;
  const endDateTimeStr = `${EventDate} ${endTime}`;
  const parsedStart = dayjs(startDateTimeStr, 'YYYY-MM-DD HH:mm');
  const parsedEnd = dayjs(endDateTimeStr, 'YYYY-MM-DD HH:mm');

  if (!parsedStart.isValid() || !parsedEnd.isValid()) {
    return res.status(400).json({ message: 'Invalid date/time format' });
  }

  if (parsedStart >= parsedEnd) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  try {
    const normalizedName = name.trim().toUpperCase();
    const venue = await Venue.findOne({ name: normalizedName });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const conflictingEvent = await Event.findOne({
      'venueDetails.name': normalizedName,
      startTime: { $lt: parsedEnd.toDate() },
      endTime: { $gt: parsedStart.toDate() },
    });

    if (conflictingEvent) {
      return res.status(409).json({
        message: 'Venue already booked',
        conflict: {
          id: conflictingEvent._id,
          title: conflictingEvent.title,
          time: `${conflictingEvent.startTime} to ${conflictingEvent.endTime}`
        }
      });
    }

    const newEvent = new Event({
      title,
      description,
      collegeName,
      EventDate,
      startTime: parsedStart.toDate(),
      endTime: parsedEnd.toDate(),
      venueDetails: {
        venueId: venue._id,
        name: venue.name,
        capacity: venue.capacity,
        location: venue.location
      }
    });

    const savedEvent = await newEvent.save();

    req.io.emitVenueStatusChange(venue.name, 'occupied');
    req.io.emitEventUpdate(savedEvent._id, 'created');

    scheduleVenueFreeingJob(savedEvent.endTime, venue.name, req.io);

    return res.status(201).json(savedEvent);

  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllEvents(req, res) {
  const Event = req.models.Event;

  try {
    const events = await Event.find().sort({ startTime: 1 }).lean();

    const now = new Date();
    const eventsWithStatus = events.map(event => ({
      ...event,
      status: new Date(event.endTime) < now ? 'completed' :
              new Date(event.startTime) > now ? 'upcoming' : 'ongoing'
    }));

    return res.json(eventsWithStatus);

  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getEventById(req, res) {
  const Event = req.models.Event;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const now = new Date();
    const status = new Date(event.endTime) < now ? 'completed' :
                   new Date(event.startTime) > now ? 'upcoming' : 'ongoing';

    return res.json({ ...event.toObject(), status });

  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// export async function updateEvent(req, res) {
//   const Event = req.models.Event;
//   const { id } = req.params;
//   const updates = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: 'Invalid event ID' });
//   }

//   try {
//     const existingEvent = await Event.findById(id);
//     if (!existingEvent) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     if (new Date(existingEvent.startTime) < new Date()) {
//       return res.status(400).json({ message: 'Cannot modify past events' });
//     }

//     // Parse and format times
//     const { EventDate, startTime, endTime } = updates;
//     const updatePayload = { ...updates };

//     if (EventDate && startTime) {
//       const parsedStart = dayjs(`${EventDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
//       if (!parsedStart.isValid()) {
//         return res.status(400).json({ message: 'Invalid start time format' });
//       }
//       updatePayload.startTime = parsedStart.toDate();
//     }

//     if (EventDate && endTime) {
//       const parsedEnd = dayjs(`${EventDate} ${endTime}`, 'YYYY-MM-DD HH:mm');
//       if (!parsedEnd.isValid()) {
//         return res.status(400).json({ message: 'Invalid end time format' });
//       }
//       updatePayload.endTime = parsedEnd.toDate();
//     }

//     if (EventDate) {
//       updatePayload.EventDate = EventDate; // still store the string if required
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(id, updatePayload, {
//       new: true,
//       runValidators: true,
//     });

//     req.io.emitEventUpdate(id, 'updated');
//     return res.json(updatedEvent);

//   } catch (error) {
//     console.error('Update event error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

export async function updateEvent(req, res) {
  const Event = req.models.Event;
  const Venue = req.models.Venue;
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent editing past events
    if (new Date(existingEvent.startTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot modify past events' });
    }

    // Step 1: Merge updates with existing values
    const updatedTitle = updates.title || existingEvent.title;
    const updatedDescription = updates.description || existingEvent.description;
    const updatedCollegeName = updates.collegeName || existingEvent.collegeName;
    const updatedRoomnumber = updates.roomnumber || existingEvent.venueDetails.roomnumber;
    const updatedEventDate = updates.EventDate || dayjs(existingEvent.startTime).format('YYYY-MM-DD');
    const updatedStartTime = updates.startTime || dayjs(existingEvent.startTime).format('HH:mm');
    const updatedEndTime = updates.endTime || dayjs(existingEvent.endTime).format('HH:mm');

    // Step 2: Parse new start and end time
    const parsedStart = dayjs(`${updatedEventDate} ${updatedStartTime}`, 'YYYY-MM-DD HH:mm');
    const parsedEnd = dayjs(`${updatedEventDate} ${updatedEndTime}`, 'YYYY-MM-DD HH:mm');

    if (!parsedStart.isValid() || !parsedEnd.isValid()) {
      return res.status(400).json({ message: 'Invalid date/time format' });
    }

    if (parsedStart >= parsedEnd) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const normalizedRoom = updatedRoomnumber.trim().toUpperCase();
    const venue = await Venue.findOne({ roomnumber: normalizedRoom });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Step 3: Check venue conflict if time or room number changed
    if (
      normalizedRoom !== existingEvent.venueDetails.roomnumber ||
      parsedStart.toISOString() !== existingEvent.startTime.toISOString() ||
      parsedEnd.toISOString() !== existingEvent.endTime.toISOString()
    ) {
      const conflict = await Event.findOne({
        _id: { $ne: id },
        'venueDetails.roomnumber': normalizedRoom,
        startTime: { $lt: parsedEnd.toDate() },
        endTime: { $gt: parsedStart.toDate() },
      });

      if (conflict) {
        return res.status(409).json({
          message: 'Venue already booked for the selected time',
          conflict: {
            id: conflict._id,
            title: conflict.title,
            time: `${conflict.startTime} to ${conflict.endTime}`,
          },
        });
      }
    }

    // Step 4: Apply update
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title: updatedTitle,
        description: updatedDescription,
        collegeName: updatedCollegeName,
        EventDate: updatedEventDate,
        startTime: parsedStart.toDate(),
        endTime: parsedEnd.toDate(),
        venueDetails: {
          venueId: venue._id,
          roomnumber: venue.roomnumber,
          location: venue.location,
          capacity: venue.capacity,
        },
      },
      { new: true, runValidators: true }
    );

    req.io.emitVenueStatusChange(venue.roomnumber, 'occupied');
    req.io.emitEventUpdate(id, 'updated');

    return res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


export async function deleteEvent(req, res) {
  const Event = req.models.Event;
  const Venue = req.models.Venue;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.venueDetails?.venueId) {
      await Venue.findByIdAndUpdate(
        event.venueDetails.venueId,
        { status: 'available' }
      );

      req.io.emitVenueStatusChange(event.venueDetails.name, 'available');
      req.io.emitEventUpdate(id, 'deleted');
    }

    return res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
