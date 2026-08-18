import React from 'react';
import {
  Briefcase,
  MessageSquareText,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  jobsCount,
  draftFieldsCount,
  theme,
  toggleTheme,
  apiOnline,
}) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="logo-icon-wrapper">
          <Sparkles size={22} />
        </div>
        <div className="logo-text">
          <h1>JobFlow AI</h1>
          <span>Parser & Hub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>

        <button
          className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
          id="nav-jobs-tab"
        >
          <div className="nav-item-left">
            <Briefcase size={18} className="nav-icon" />
            <span>Jobs Hub</span>
          </div>
          <span className="nav-badge" id="jobs-count-badge">
            {jobsCount}
          </span>
        </button>

        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
          id="nav-chat-tab"
        >
          <div className="nav-item-left">
            <MessageSquareText size={18} className="nav-icon" />
            <span>AI Chat Assistant</span>
          </div>
          {draftFieldsCount > 0 && draftFieldsCount < 6 && (
            <span
              className="nav-badge"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                borderColor: 'rgba(245, 158, 11, 0.4)',
              }}
            >
              Draft ({draftFieldsCount}/6)
            </span>
          )}
        </button>

        {/* Live Draft Progress Widget if in progress */}
        {draftFieldsCount > 0 && (
          <div className="sidebar-draft-widget">
            <div className="draft-widget-header">
              <span className="draft-widget-title">
                <Layers size={14} /> Active Draft
              </span>
              <span className="draft-widget-progress">
                {Math.round((draftFieldsCount / 6) * 100)}%
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${(draftFieldsCount / 6) * 100}%` }}
              />
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="status-badge-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} /> SQLite DB
          </span>
          <span
            className="status-pill"
            style={{
              background: apiOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: apiOnline ? '#10b981' : '#ef4444',
              borderColor: apiOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            }}
          >
            <span
              className="status-dot"
              style={{
                backgroundColor: apiOnline ? '#10b981' : '#ef4444',
                boxShadow: apiOnline ? '0 0 6px #10b981' : '0 0 6px #ef4444',
              }}
            />
            {apiOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} /> Light Mode
            </>
          ) : (
            <>
              <Moon size={15} /> Dark Mode
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
