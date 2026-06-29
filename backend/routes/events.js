import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getEvents, saveEvents } from '../data/db.js';

const router = express.Router();

// Helper to filter events based on query params
const filterEvents = (events, query) => {
  let filtered = [...events];
  const { category, search, dateRange } = query;

  if (category && category !== 'All') {
    filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.location.toLowerCase().includes(searchLower)
    );
  }

  if (dateRange) {
    const today = new Date().toISOString().split('T')[0];
    if (dateRange === 'upcoming') {
      filtered = filtered.filter(e => e.date >= today);
    } else if (dateRange === 'past') {
      filtered = filtered.filter(e => e.date < today);
    }
  }

  // Sort by date: upcoming events sorted ascending, past events sorted descending
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  return filtered;
};

// GET all events
router.get('/', (req, res) => {
  const events = getEvents();
  const filtered = filterEvents(events, req.query);
  res.json(filtered);
});

// GET single event
router.get('/:id', (req, res) => {
  const events = getEvents();
  const event = events.find(e => e.id === req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json(event);
});

// POST create event
router.post('/', (req, res) => {
  const { title, description, date, time, location, category, organizer, capacity, image } = req.body;

  if (!title || !description || !date || !time || !location || !category || !organizer || !capacity) {
    return res.status(400).json({ message: "Missing required event fields" });
  }

  const events = getEvents();
  const newEvent = {
    id: uuidv4(),
    title,
    description,
    date,
    time,
    location,
    category,
    organizer,
    capacity: parseInt(capacity, 10),
    attendees: [],
    image: image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80"
  };

  events.push(newEvent);
  saveEvents(events);

  res.status(201).json(newEvent);
});

// PUT update event
router.put('/:id', (req, res) => {
  const { title, description, date, time, location, category, capacity, image } = req.body;
  const events = getEvents();
  const eventIndex = events.findIndex(e => e.id === req.params.id);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  const updatedEvent = {
    ...events[eventIndex],
    title: title || events[eventIndex].title,
    description: description || events[eventIndex].description,
    date: date || events[eventIndex].date,
    time: time || events[eventIndex].time,
    location: location || events[eventIndex].location,
    category: category || events[eventIndex].category,
    capacity: capacity ? parseInt(capacity, 10) : events[eventIndex].capacity,
    image: image || events[eventIndex].image
  };

  events[eventIndex] = updatedEvent;
  saveEvents(events);

  res.json(updatedEvent);
});

// DELETE event
router.delete('/:id', (req, res) => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== req.params.id);

  if (events.length === filtered.length) {
    return res.status(404).json({ message: "Event not found" });
  }

  saveEvents(filtered);
  res.json({ message: "Event successfully deleted", id: req.params.id });
});

// POST register / unregister attendee
router.post('/:id/register', (req, res) => {
  const { email, name, action } = req.body; // action: 'register' or 'unregister'

  if (!email || !name) {
    return res.status(400).json({ message: "Attendee email and name are required" });
  }

  const events = getEvents();
  const event = events.find(e => e.id === req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const attendeeIndex = event.attendees.findIndex(a => a.email === normalizedEmail);

  if (action === 'unregister') {
    if (attendeeIndex === -1) {
      return res.status(400).json({ message: "You are not registered for this event" });
    }
    // Remove attendee
    event.attendees.splice(attendeeIndex, 1);
  } else {
    // Default action is register
    if (attendeeIndex !== -1) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: "This event is fully booked" });
    }
    // Add attendee
    event.attendees.push({
      email: normalizedEmail,
      name: name.trim(),
      registeredAt: new Date().toISOString()
    });
  }

  saveEvents(events);
  res.json(event);
});

export default router;
