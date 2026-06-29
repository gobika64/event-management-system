import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Clock, Users, ArrowLeft, Mail, Lock, User, 
  Trash2, Edit, AlertCircle, CheckCircle, Search, RefreshCw, X 
} from 'lucide-react';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import EventForm from './components/EventForm';
import Analytics from './components/Analytics';

export default function App() {
  // --- STATE ---
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [currentView, setView] = useState('explore'); // 'explore' | 'analytics' | 'dashboard' | 'detail'
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Event Form State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Toast Alerts
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  // --- THEME ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- TOAST ALERTS HELPER ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- API CALLS ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (dateFilter && dateFilter !== 'all') params.append('dateRange', dateFilter);

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
      
      // If we are looking at the details page, refresh the selected event's details
      if (selectedEvent) {
        const refreshedEvent = data.find(e => e.id === selectedEvent.id);
        if (refreshedEvent) setSelectedEvent(refreshedEvent);
      }
    } catch (err) {
      console.error(err);
      showToast("Could not connect to the API server.", "error");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchTerm, dateFilter, selectedEvent]);

  // Fetch events on filter change
  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, dateFilter, searchTerm]);

  // --- AUTH ACTIONS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (authTab === 'login') {
      if (!authForm.email || !authForm.password) {
        setAuthError("Please fill in all fields");
        return;
      }
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email, password: authForm.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to log in");
        
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setIsAuthOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast(`Welcome back, ${data.name}!`);
      } catch (err) {
        setAuthError(err.message);
      }
    } else {
      if (!authForm.name || !authForm.email || !authForm.password) {
        setAuthError("All fields are required");
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setIsAuthOpen(false);
        setAuthForm({ name: '', email: '', password: '' });
        showToast(`Account created! Welcome, ${data.name}`);
      } catch (err) {
        setAuthError(err.message);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('explore');
    showToast("Successfully logged out");
  };

  // --- EVENT MANAGEMENT ACTIONS ---
  const handleCreateOrUpdateEvent = async (formData) => {
    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      
      const payload = {
        ...formData,
        organizer: user.email
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Could not save event");

      setIsFormOpen(false);
      setEditingEvent(null);
      showToast(editingEvent ? "Event updated successfully!" : "Event published successfully!");
      fetchEvents();
      
      if (editingEvent) {
        setSelectedEvent(data);
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete event");
      
      showToast("Event successfully removed");
      setView('explore');
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleRegisterEvent = async (eventId, action = 'register') => {
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.name, action })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Action failed");

      showToast(action === 'register' ? "You are registered! Check your schedule." : "Your registration was cancelled.");
      
      // Update local state immediately
      setEvents(prev => prev.map(e => e.id === eventId ? data : e));
      setSelectedEvent(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Check if current user is registered for the selected event
  const isRegisteredForEvent = (event) => {
    if (!user || !event || !event.attendees) return false;
    return event.attendees.some(a => a.email.toLowerCase() === user.email.toLowerCase());
  };

  // Filter lists for the user schedule dashboard
  const userRegisteredEvents = events.filter(e => isRegisteredForEvent(e));
  const userOrganizedEvents = events.filter(e => user && e.organizer?.toLowerCase() === user.email.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onOpenAuth={() => { setAuthError(''); setAuthTab('login'); setIsAuthOpen(true); }}
        onLogout={handleLogout}
        onOpenCreateForm={() => { setEditingEvent(null); setIsFormOpen(true); }}
        currentView={currentView}
        setView={setView}
      />

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        <div className="container">
          
          {/* VIEW: EXPLORE & BROWSE */}
          {currentView === 'explore' && (
            <>
              {/* Hero Banner */}
              <section className="hero-section">
                <span className="hero-badge">Discover & Gather</span>
                <h1 className="hero-title">Connecting People Through Shared Experiences</h1>
                <p className="hero-subtitle">
                  Browse premium local and global gatherings. RSVP instantly, track capacities, and schedule your calendar in one seamless workspace.
                </p>
              </section>

              {/* Filtering Controls */}
              <div className="controls-bar glass-panel">
                {/* Search Box */}
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    placeholder="Search events, locations, organizers..."
                  />
                </div>

                {/* Filter Settings */}
                <div className="filter-group">
                  {/* Category Pills */}
                  {['All', 'Tech', 'Music', 'Arts', 'Food', 'Sports'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`category-tab ${categoryFilter === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                  
                  {/* Date Scope select dropdown */}
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="upcoming">Upcoming Events</option>
                    <option value="past">Past Events</option>
                    <option value="all">All Dates</option>
                  </select>

                  <button className="btn-icon" onClick={fetchEvents} title="Refresh data">
                    <RefreshCw size={18} className={loading ? "spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Event Cards Grid Layout */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  <RefreshCw className="spin" size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                  <p>Retrieving events from data stores...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', marginBottom: '4rem' }}>
                  <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No events matched your search</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Try removing category filters, checking keyword spellings, or creating a new event!
                  </p>
                </div>
              ) : (
                <div className="event-grid">
                  {events.map(event => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      onClick={() => { setSelectedEvent(event); setView('detail'); }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* VIEW: DETAILED VIEW OF SINGLE EVENT */}
          {currentView === 'detail' && selectedEvent && (
            <>
              <div className="back-btn-container">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setView('explore')}
                >
                  <ArrowLeft size={16} /> Back to Events
                </button>
              </div>

              <div className="event-details-layout">
                {/* Main Details Panel */}
                <div className="glass-panel details-main-panel">
                  <div className="details-hero-img-wrapper">
                    <img 
                      src={selectedEvent.image} 
                      alt="" 
                      className="details-hero-img" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <span className="card-category-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '1rem' }}>
                    {selectedEvent.category}
                  </span>
                  
                  <h1 className="details-title">{selectedEvent.title}</h1>
                  
                  {/* Meta Details Grid */}
                  <div className="details-meta-grid">
                    <div className="details-meta-card">
                      <div className="details-meta-icon"><Clock size={20} /></div>
                      <div>
                        <div className="details-meta-label">Date & Time</div>
                        <div className="details-meta-val">{selectedEvent.date} @ {selectedEvent.time}</div>
                      </div>
                    </div>

                    <div className="details-meta-card">
                      <div className="details-meta-icon"><MapPin size={20} /></div>
                      <div>
                        <div className="details-meta-label">Location</div>
                        <div className="details-meta-val">{selectedEvent.location}</div>
                      </div>
                    </div>

                    <div className="details-meta-card">
                      <div className="details-meta-icon"><Users size={20} /></div>
                      <div>
                        <div className="details-meta-label">Capacity</div>
                        <div className="details-meta-val">{selectedEvent.attendees?.length || 0} / {selectedEvent.capacity} seats</div>
                      </div>
                    </div>
                  </div>

                  <div className="details-body">
                    <h3 className="details-body-title">About this event</h3>
                    <p className="details-body-text">{selectedEvent.description}</p>
                  </div>
                  
                  <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Hosted by:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedEvent.organizer}</strong>
                  </div>
                </div>

                {/* RSVP Sidebar Panel */}
                <div className="glass-panel rsvp-widget">
                  <div className="rsvp-header">
                    <h3 className="rsvp-status-title">Reservation</h3>
                    
                    {/* Capacity Indicator Progress Bar */}
                    <div className="capacity-tracker" style={{ margin: '1rem 0' }}>
                      <div className="capacity-labels">
                        <span>Total Registered</span>
                        <span>
                          {selectedEvent.capacity - (selectedEvent.attendees?.length || 0)} spots left
                        </span>
                      </div>
                      <div className="capacity-bar-bg" style={{ height: '8px' }}>
                        <div 
                          className="capacity-bar-fill" 
                          style={{ 
                            width: `${Math.min(100, Math.round(((selectedEvent.attendees?.length || 0) / selectedEvent.capacity) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons based on organizer & attendance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {user && selectedEvent.organizer?.toLowerCase() === user.email.toLowerCase() ? (
                      // Organizer Tools
                      <>
                        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: '600' }}>
                          ℹ️ You are organizing this event.
                        </div>
                        <button 
                          className="btn btn-primary"
                          onClick={() => { setEditingEvent(selectedEvent); setIsFormOpen(true); }}
                        >
                          <Edit size={16} /> Edit Event
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                        >
                          <Trash2 size={16} /> Cancel Event
                        </button>
                      </>
                    ) : (
                      // Attendee Registration Action
                      <>
                        {isRegisteredForEvent(selectedEvent) ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            onClick={() => handleRegisterEvent(selectedEvent.id, 'unregister')}
                          >
                            Cancel Reservation
                          </button>
                        ) : (
                          <button 
                            className="btn btn-accent" 
                            style={{ width: '100%' }}
                            disabled={selectedEvent.attendees?.length >= selectedEvent.capacity}
                            onClick={() => handleRegisterEvent(selectedEvent.id, 'register')}
                          >
                            {selectedEvent.attendees?.length >= selectedEvent.capacity 
                              ? 'Fully Booked' 
                              : user ? 'Register & RSVP' : 'Sign In to Register'
                            }
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Attendee Roster (Attendee List) */}
                  <div className="attendee-list-section">
                    <h4 className="attendee-list-title">Attendees roster ({selectedEvent.attendees?.length || 0})</h4>
                    {selectedEvent.attendees?.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No registrations yet. Be the first to join!
                      </p>
                    ) : (
                      <div className="attendee-list">
                        {selectedEvent.attendees.map((att, idx) => (
                          <div key={idx} className="attendee-row">
                            <span className="attendee-name">{att.name}</span>
                            <span className="attendee-email">Registered</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW: PLATFORM ANALYTICS DASHBOARD */}
          {currentView === 'analytics' && (
            <Analytics events={events} />
          )}

          {/* VIEW: USER SCHEDULER & DASHBOARD */}
          {currentView === 'dashboard' && (
            <div style={{ padding: '2rem 0' }}>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '2rem', fontFamily: 'var(--font-display)' }}>
                Your Event Workspace
              </h2>

              {/* Section 1: Registered Events */}
              <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  🗓️ Registered Schedule ({userRegisteredEvents.length})
                </h3>
                {userRegisteredEvents.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't RSVP'd for any upcoming events yet.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setView('explore')}>
                      Explore Events
                    </button>
                  </div>
                ) : (
                  <div className="event-grid">
                    {userRegisteredEvents.map(event => (
                      <EventCard 
                        key={event.id}
                        event={event}
                        onClick={() => { setSelectedEvent(event); setView('detail'); }}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Section 2: Hosting Events */}
              <section>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  💼 Events You Host ({userOrganizedEvents.length})
                </h3>
                {userOrganizedEvents.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You aren't organizing any active events.</p>
                    <button className="btn btn-accent" style={{ marginTop: '1rem' }} onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}>
                      Host an Event
                    </button>
                  </div>
                ) : (
                  <div className="event-grid">
                    {userOrganizedEvents.map(event => (
                      <EventCard 
                        key={event.id}
                        event={event}
                        onClick={() => { setSelectedEvent(event); setView('detail'); }}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0', marginTop: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            © 2026 EventHub Inc. Designed with premium UX components.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setView('explore')}>Home</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setView('analytics')}>Analytics</span>
            <span style={{ cursor: 'pointer' }} onClick={() => window.open('#')}>Privacy Policy</span>
          </div>
        </div>
      </footer>

      {/* --- FORM OVERLAY MODAL (CREATE / EDIT) --- */}
      <EventForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingEvent(null); }}
        onSubmit={handleCreateOrUpdateEvent}
        initialData={editingEvent}
      />

      {/* --- USER AUTHENTICATION OVERLAY MODAL --- */}
      {isAuthOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <button className="modal-close" onClick={() => setIsAuthOpen(false)} aria-label="Close Authentication">
              <X size={24} />
            </button>

            {/* Login / Register Tab switches */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '1.75rem' }}>
              <button 
                type="button"
                className="btn"
                style={{ 
                  flex: 1, 
                  borderRadius: 0, 
                  background: 'none', 
                  borderBottom: authTab === 'login' ? '3px solid var(--primary)' : 'none',
                  color: authTab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: '700'
                }}
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
              >
                Sign In
              </button>
              <button 
                type="button"
                className="btn"
                style={{ 
                  flex: 1, 
                  borderRadius: 0, 
                  background: 'none', 
                  borderBottom: authTab === 'register' ? '3px solid var(--primary)' : 'none',
                  color: authTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: '700'
                }}
                onClick={() => { setAuthTab('register'); setAuthError(''); }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: '500' }}>
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authTab === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      value={authForm.name}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Arjun Kumar"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }}>
                {authTab === 'login' ? 'Access Workspace' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TOAST FLOATING BANNER ALERT --- */}
      {toast && (
        <div className={`alert-toast ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
