import React from 'react';
import { Calendar, Users, Percent, Award, ChevronRight } from 'lucide-react';

export default function Analytics({ events }) {
  // 1. Calculate General Metrics
  const totalEvents = events.length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);
  
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const occupancyRate = totalCapacity > 0 
    ? Math.round((totalAttendees / totalCapacity) * 100) 
    : 0;

  // 2. Calculate Category Breakdown
  const categoryCounts = events.reduce((acc, e) => {
    const cat = e.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { count: 0, RSVPs: 0 };
    }
    acc[cat].count += 1;
    acc[cat].RSVPs += e.attendees?.length || 0;
    return acc;
  }, {});

  // Find Popular Category based on total RSVPs
  let popularCategory = 'None';
  let maxRSVPs = -1;
  Object.keys(categoryCounts).forEach(cat => {
    if (categoryCounts[cat].RSVPs > maxRSVPs) {
      maxRSVPs = categoryCounts[cat].RSVPs;
      popularCategory = cat;
    }
  });

  // 3. Sort Events by Popularity (Attendance Ratio or Attendees Count)
  const popularEvents = [...events]
    .map(e => ({
      ...e,
      ratio: e.capacity > 0 ? Math.round(((e.attendees?.length || 0) / e.capacity) * 100) : 0
    }))
    .sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))
    .slice(0, 4);

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
        Platform Performance Dashboard
      </h2>

      {/* Grid of Key Performance Cards */}
      <div className="analytics-grid">
        {/* Total Events */}
        <div className="analytics-card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="analytics-icon-box" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="analytics-val">{totalEvents}</div>
            <div className="analytics-label">Total Events</div>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="analytics-card glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="analytics-icon-box" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="analytics-val">{totalAttendees}</div>
            <div className="analytics-label">Total RSVPs</div>
          </div>
        </div>

        {/* Attendance Ratio */}
        <div className="analytics-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="analytics-icon-box" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <Percent size={24} />
          </div>
          <div>
            <div className="analytics-val">{occupancyRate}%</div>
            <div className="analytics-label">Capacity Filled</div>
          </div>
        </div>

        {/* Popular Category */}
        <div className="analytics-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="analytics-icon-box" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="analytics-val" style={{ fontSize: '1.4rem' }}>{popularCategory}</div>
            <div className="analytics-label">Top Category</div>
          </div>
        </div>
      </div>

      {/* Layout Split: Category breakdown and popular events list */}
      <div className="event-details-layout">
        {/* Popular Events Table */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 Top Performing Events
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {popularEvents.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No performance data available.</p>
            ) : (
              popularEvents.map(event => (
                <div 
                  key={event.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--border-color)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <img 
                      src={event.image} 
                      alt="" 
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {event.category} • {event.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {event.attendees?.length || 0} RSVPs
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {event.ratio}% cap.
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            📊 Category Analysis
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Tech', 'Music', 'Arts', 'Food', 'Sports'].map(cat => {
              const info = categoryCounts[cat] || { count: 0, RSVPs: 0 };
              const rsvpPercentage = totalAttendees > 0 
                ? Math.round((info.RSVPs / totalAttendees) * 100) 
                : 0;

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600' }}>
                    <span>{cat} ({info.count} {info.count === 1 ? 'event' : 'events'})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {info.RSVPs} RSVPs ({rsvpPercentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${rsvpPercentage}%`, 
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--accent)'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
