const Event = require('../models/Event');
const { AppError } = require('../middleware/errorHandler');

const createEvent = async (eventData) => {
  const event = await Event.create(eventData);
  return event;
};

const updateEvent = async (eventId, eventData) => {
  const event = await Event.findByIdAndUpdate(eventId, eventData, { 
    new: true, 
    runValidators: true 
  });
  
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
};

const deleteEvent = async (eventId) => {
  // Find and delete the event
  const event = await Event.findByIdAndDelete(eventId);
  
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  
  // NOTE: In a massive production app, you might also want to delete or 
  return event;
};

module.exports = { createEvent, updateEvent, deleteEvent };