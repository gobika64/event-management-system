import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname);
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate dates relative to current date for dynamic mock data
const getRelativeDateString = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

// Initial mock data
const DEFAULT_EVENTS = [
  {
    id: "1",
    title: "Global Tech Summit 2026",
    description: "Join industry leaders, developers, and innovators for the most anticipated tech conference of the year. Explore quantum computing, advanced AI agent development, and the future of web architectures through keynotes, hands-on workshops, and networking sessions.",
    date: getRelativeDateString(5),
    time: "09:00",
    location: "Silicon Valley Convention Center, CA & Online",
    category: "Tech",
    organizer: "tech_guild@example.com",
    capacity: 200,
    attendees: [
      { email: "arjun@example.com", name: "Arjun", registeredAt: new Date().toISOString() },
      { email: "sarah.k@example.com", name: "Sarah Koenig", registeredAt: new Date().toISOString() }
    ],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    title: "Neon Echoes Indie Music Festival",
    description: "Experience the ultimate night of indie pop and electronic beats under the stars. Featuring live sets from chart-topping indie artists, local food trucks, and interactive art installations. A night of pure musical euphoria.",
    date: getRelativeDateString(2),
    time: "18:30",
    location: "Sunset Open-Air Amphitheater, Austin TX",
    category: "Music",
    organizer: "music_collective@example.com",
    capacity: 500,
    attendees: [
      { email: "sarah.k@example.com", name: "Sarah Koenig", registeredAt: new Date().toISOString() }
    ],
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "3",
    title: "Culinary Fusion Masterclass",
    description: "Unlock the secrets of gourmet cooking! Learn how to combine traditional French techniques with bold Asian flavors. Led by Michelin-starred chef Marcus Vance, this interactive workshop includes an exquisite 5-course tasting menu.",
    date: getRelativeDateString(10),
    time: "11:00",
    location: "Taste Lab Studios, NYC",
    category: "Food",
    organizer: "chef_marcus@example.com",
    capacity: 25,
    attendees: [],
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "4",
    title: "Championship Soccer Tournament",
    description: "Cheer for your local teams as they battle for the cup! The annual regional soccer finals are here. Expect food trucks, fan zones, merchandise, and a highly competitive atmosphere for soccer enthusiasts.",
    date: getRelativeDateString(-3), // Past event
    time: "15:00",
    location: "City Athletics Park, Chicago IL",
    category: "Sports",
    organizer: "sports_league@example.com",
    capacity: 1000,
    attendees: [
      { email: "arjun@example.com", name: "Arjun", registeredAt: new Date().toISOString() },
      { email: "john.doe@example.com", name: "John Doe", registeredAt: new Date().toISOString() }
    ],
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "5",
    title: "Immersive Abstract Art Workshop",
    description: "Express your inner world onto canvas! Acquire experimental painting techniques, work with mixed media, and explore color theory in a relaxed studio setting. All materials (acrylics, canvases, brushes) are included.",
    date: getRelativeDateString(12),
    time: "14:00",
    location: "Cozy Brush Studios, Portland OR",
    category: "Arts",
    organizer: "arts_collective@example.com",
    capacity: 15,
    attendees: [
      { email: "jane.smith@example.com", name: "Jane Smith", registeredAt: new Date().toISOString() }
    ],
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80"
  }
];

const DEFAULT_USERS = [
  {
    email: "arjun@example.com",
    passwordHash: "password123", // Simple plain password for mock authentication
    name: "Arjun Kumar"
  },
  {
    email: "sarah.k@example.com",
    passwordHash: "password123",
    name: "Sarah Koenig"
  }
];

export const getEvents = () => {
  try {
    if (!fs.existsSync(EVENTS_FILE)) {
      saveEvents(DEFAULT_EVENTS);
      return DEFAULT_EVENTS;
    }
    const data = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading events DB, resetting to defaults...", err);
    saveEvents(DEFAULT_EVENTS);
    return DEFAULT_EVENTS;
  }
};

export const saveEvents = (events) => {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving events DB:", err);
    return false;
  }
};

export const getUsers = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users DB, resetting to defaults...", err);
    saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }
};

export const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving users DB:", err);
    return false;
  }
};
