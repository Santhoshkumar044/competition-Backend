
import mongoose from 'mongoose';
import { scheduleVenueFreeingJob } from '../utils/scheduleJobs.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

export async function createEvent(req, res) {
  
  const Event =  req.models.Event;
  const Venue = req.models.Venue;

  // Validation
  const { title, description, collegeName, startTime, endTime, roomnumber, EventDate } = req.body;

if (!title || !description || !collegeName || !roomnumber || !EventDate || !startTime || !endTime) {
  return res.status(400).json({ message: 'All fields are required' });
}

  const startDateTimeStr = `${EventDate} ${startTime}`;  // "10-07-2025 05:00 PM"
  const endDateTimeStr = `${EventDate} ${endTime}`;      // "10-07-2025 06:00 PM"
  const parsedStart = dayjs(startDateTimeStr, 'YYYY-MM-DD HH:mm');
  const parsedEnd = dayjs(endDateTimeStr, 'YYYY-MM-DD HH:mm');
  console.log('EventDate:', EventDate);
  if (!parsedStart.isValid() || !parsedEnd.isValid()) {
    return res.status(400).json({ message: 'Invalid date/time format' });
  }

  // if (new Date(startTime) >= new Date(endTime)) {
  //   return res.status(400).json({ message: 'End time must be after start time' });
  // }
  if (parsedStart >= parsedEnd) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }

  try {
    const normalizedRoom = roomnumber.trim().toUpperCase();
    const venue = await Venue.findOne({ roomnumber: normalizedRoom });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Check for conflicts
    const conflictingEvent = await Event.findOne({
      'venueDetails.roomnumber': normalizedRoom,
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

    // Create event
    const newEvent = new Event({
      title,
      description,
      collegeName,
      EventDate,
      startTime: parsedStart.toDate(),
      endTime: parsedEnd.toDate(),
      venueDetails: {
        venueId: venue._id,
        roomnumber: venue.roomnumber,
        capacity: venue.capacity,
        location: venue.location
      }
    });

    const savedEvent = await newEvent.save();

    // Socket.IO notifications
    req.io.emitVenueStatusChange(venue.roomnumber, 'occupied');
    req.io.emitEventUpdate(savedEvent._id, 'created');
    
    // Schedule automatic venue freeing
    scheduleVenueFreeingJob(savedEvent.endTime, venue.roomnumber, req.io);

    return res.status(201).json(savedEvent);

  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllEvents(req, res) {
  const Event = req.models.Event;

  try {
    const events = await Event.find()
      .sort({ startTime: 1 })
      .lean();

    // Add status based on current time
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

    // Add real-time status
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
//     // Prevent updating past events
//     const existingEvent = await Event.findById(id);
//     if (!existingEvent) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     if (new Date(existingEvent.startTime) < new Date()) {
//       return res.status(400).json({ message: 'Cannot modify past events' });
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(
//       id,
//       { ...updates, startTime: new Date(updates.startTime), endTime: new Date(updates.endTime) },
//       { new: true, runValidators: true }
//     );

//     // Notify clients
//     req.io.emitEventUpdate(id, 'updated');

//     return res.json(updatedEvent);

//   } catch (error) {
//     console.error('Update event error:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }

export async function updateEvent(req, res) {
  const Event = req.models.Event;
  const { id } = req.params;
  const updates = req.body;

  // ✅ Validate the MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    // ✅ Fetch the existing event
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // ✅ Disallow updates to past events
    if (new Date(existingEvent.startTime) < new Date()) {
      return res.status(400).json({ message: 'Cannot modify past events' });
    }

    // ✅ Build the update payload
    const updatePayload = {
      ...updates, // Copy all updatable fields from the request
    };

    // ✅ If startTime is present, convert to Date object
    if (updates.startTime) {
      updatePayload.startTime = new Date(updates.startTime);
    }

    // ✅ If endTime is present, convert to Date object
    if (updates.endTime) {
      updatePayload.endTime = new Date(updates.endTime);
    }

    // ✅ If EventDate is present, add it to the update (expecting a string like 'YYYY-MM-DD')
    if (updates.EventDate) {
      updatePayload.EventDate = updates.EventDate;
    }

    // ✅ Perform the update and return the new document
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,           // Return the updated document
        runValidators: true  // Run schema validations
      }
    );

    // ✅ Notify connected clients about the update (via socket.io or similar)
    req.io.emitEventUpdate(id, 'updated');

    // ✅ Return the updated event
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

    // Free the venue if exists
    if (event.venueDetails?.venueId) {
      await Venue.findByIdAndUpdate(
        event.venueDetails.venueId,
        { status: 'free' }
      );
      // Socket.IO notifications
      req.io.emitVenueStatusChange(event.venueDetails.roomnumber, 'free');
      req.io.emitEventUpdate(id, 'deleted');
    }

    return res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}