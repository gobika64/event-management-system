# Premium Event Management System

A sleek, modern full-stack application built with React.js (Vite), Node.js (Express), and custom vanilla CSS.

## Features

- **Dashboard**: View, search, and filter events by category (e.g., Tech, Music, Arts, Food, Sports).
- **Event Management**: Create, edit, and delete events with title, details, date/time, location, and visual headers.
- **RSVP & Registration**: Real-time seat limit calculations, active attendee lists, and interactive reservation buttons.
- **Analytics Center**: Sleek charts and statistics displaying attendee details, popular categories, and overall event performance.
- **Simulated Authentication**: Mock registration/login system that enables personalized event dashboard access.
- **Premium User Experience**: Custom theme manager (Light/Dark mode), rich micro-animations, glassmorphic styling, and full responsiveness.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)

### Setup & Run
From the root directory, run the following commands:

1. **Install all dependencies** (root, frontend, and backend):
   ```bash
   npm run install:all
   ```

2. **Run both applications concurrently** (launches backend API on port 5000 and frontend dev server on port 5173):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

## Folder Structure

- `/backend`: Node.js Express server with local JSON-based data stores.
- `/frontend`: React SPA structured around a reusable design system and clean state components.
