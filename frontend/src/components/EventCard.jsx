import React from 'react';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';

export default function EventCard({ event, onClick }) {
  const { title, description, date, time, location, category, capacity, attendees, image } = event;

  // Format Date for Date Badge
  const getFormattedDateParts = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '??', month: '??' };
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' });
      return { day, month };
    } catch {
      return { day: '??', month: '??' };
    }
  };

  const { day, month } = getFormattedDateParts(date);
  
  // Calculate attendance capacity percentage
  const totalAttendees = attendees?.length || 0;
  const fillPercentage = Math.min(100, Math.round((totalAttendees / capacity) * 100));

  return (
    <article className="event-card" onClick={onClick}>
      {/* Visual Header */}
      <div className="card-img-wrapper">
        <img 
          src={image} 
          alt={title} 
          className="card-img" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80";
          }}
        />
        <span className="card-category-badge">{category}</span>
        
        {/* Absolute Date Badge */}
        <div className="card-date-badge">
          <span className="card-date-day">{day}</span>
          <span className="card-date-month">{month}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>

        {/* Capacity Bar */}
        <div className="capacity-tracker">
          <div className="capacity-labels">
            <span style={{ color: 'var(--text-secondary)' }}>Capacity Filled</span>
            <span style={{ color: fillPercentage >= 90 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {totalAttendees} / {capacity} ({fillPercentage}%)
            </span>
          </div>
          <div className="capacity-bar-bg">
            <div 
              className="capacity-bar-fill" 
              style={{ 
                width: `${fillPercentage}%`,
                background: fillPercentage >= 95 ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary), var(--accent))' 
              }}
            />
          </div>
        </div>

        {/* Location & Time Info */}
        <div className="card-meta-info" style={{ marginTop: 'auto' }}>
          <div className="meta-item">
            <MapPin size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </span>
          </div>
          <div className="meta-item">
            <Clock size={15} style={{ color: 'var(--primary)' }} />
            <span>{date} @ {time}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
