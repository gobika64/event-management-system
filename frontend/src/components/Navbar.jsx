import React from 'react';
import { Calendar, Moon, Sun, LogIn, LogOut, PlusCircle, BarChart2, Briefcase } from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  user,
  onOpenAuth,
  onLogout,
  onOpenCreateForm,
  currentView,
  setView
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="app-header glass-panel">
      <div className="container navbar-container">
        {/* Logo */}
        <div className="logo" onClick={() => setView('explore')}>
          <Calendar size={28} style={{ color: 'var(--primary)' }} />
          <span>EventHub</span>
        </div>

        {/* Links & Controls */}
        <div className="nav-links">
          <button 
            className={`btn btn-secondary ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => setView('explore')}
          >
            Explore
          </button>
          
          <button 
            className={`btn btn-secondary ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setView('analytics')}
          >
            <BarChart2 size={16} />
            Analytics
          </button>

          {user && (
            <>
              <button 
                className={`btn btn-secondary ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                <Briefcase size={16} />
                My Schedule
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={onOpenCreateForm}
              >
                <PlusCircle size={16} />
                Create Event
              </button>
            </>
          )}

          {/* Theme Switcher */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-profile-badge">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <span className="user-name" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={onLogout}
                title="Log out"
                style={{ padding: '8px 12px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-accent" 
              onClick={onOpenAuth}
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
