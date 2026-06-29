import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, List, Info, Image, Users, Clock } from 'lucide-react';

const CATEGORY_IMAGES = {
  Tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
  Music: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
  Arts: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
  Food: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80"
};

export default function EventForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech',
    date: '',
    time: '',
    location: '',
    capacity: 100,
    image: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Tech',
        date: initialData.date || '',
        time: initialData.time || '',
        location: initialData.location || '',
        capacity: initialData.capacity || 100,
        image: initialData.image || '',
        description: initialData.description || ''
      });
    } else {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        category: 'Tech',
        date: today,
        time: '12:00',
        location: '',
        capacity: 100,
        image: '',
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is typed in
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Use default premium Unsplash image if no custom image is set
    const submitData = { ...formData };
    if (!submitData.image.trim()) {
      submitData.image = CATEGORY_IMAGES[submitData.category] || CATEGORY_IMAGES.Tech;
    }

    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close Form">
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {initialData ? 'Edit Event Details' : 'Design New Event'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Next-Gen Developer Workshop"
            />
            {errors.title && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.title}</span>}
          </div>

          {/* Category & Capacity */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Tech">Tech & Engineering</option>
                <option value="Music">Music & Festival</option>
                <option value="Arts">Arts & Painting</option>
                <option value="Food">Food & Gastronomy</option>
                <option value="Sports">Sports & Fitness</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Capacity Limit</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="form-input"
                min="1"
              />
              {errors.capacity && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.capacity}</span>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
              {errors.date && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-input"
              />
              {errors.time && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.time}</span>}
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location / Address</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. 101 Innovation Blvd, San Francisco"
            />
            {errors.location && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.location}</span>}
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label className="form-label">Cover Image URL (Optional)</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/banner.jpg (or auto-assigned)"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Event Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Provide a compelling description of what attendees will experience..."
            />
            {errors.description && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{errors.description}</span>}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
