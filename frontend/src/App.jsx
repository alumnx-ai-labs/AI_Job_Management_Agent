import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  MessageSquareText,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import JobsTab from './components/JobsTab';
import ChatInterface from './components/ChatInterface';
import { fetchJobs, deleteJob, checkApiHealth } from './services/jobsApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'chat'
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [currentDraft, setCurrentDraft] = useState({});
  const [apiOnline, setApiOnline] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('jobflow_theme') || 'dark';
  });
  const [toasts, setToasts] = useState([]);

  // Toast Notification Helper
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('jobflow_theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Jobs
  const loadJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
      setApiOnline(true);
    } catch (error) {
      setApiOnline(false);
      showToast(error.message || 'Unable to connect to backend server', 'error');
    } finally {
      setIsLoadingJobs(false);
    }
  }, [showToast]);

  // Check health and initial fetch
  useEffect(() => {
    loadJobs();
    const interval = setInterval(async () => {
      const healthy = await checkApiHealth();
      setApiOnline(healthy);
    }, 20000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  // Handle Delete Job
  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast('Job deleted successfully', 'info');
    } catch (error) {
      showToast(error.message || 'Failed to delete job', 'error');
    }
  };

  // Calculate active draft filled fields
  const draftFieldsCount = Object.values(currentDraft).filter(
    (v) => v && String(v).trim().length > 0
  ).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobsCount={jobs.length}
        draftFieldsCount={draftFieldsCount}
        theme={theme}
        toggleTheme={toggleTheme}
        apiOnline={apiOnline}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navigation Bar */}
        <header className="top-nav">
          <div className="top-nav-title-group">
            <div className="tab-pill-container">
              <button
                className={`tab-pill ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
                id="top-pill-jobs"
              >
                <Briefcase size={15} />
                Jobs Hub
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'var(--bg-elevated)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    marginLeft: '2px',
                  }}
                >
                  {jobs.length}
                </span>
              </button>

              <button
                className={`tab-pill ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
                id="top-pill-chat"
              >
                <MessageSquareText size={15} />
                AI Assistant
                {draftFieldsCount > 0 && draftFieldsCount < 6 && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(245, 158, 11, 0.25)',
                      color: '#f59e0b',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      marginLeft: '2px',
                      fontWeight: 700,
                    }}
                  >
                    {draftFieldsCount}/6
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="top-nav-actions">
            {activeTab === 'jobs' ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('chat')}
              >
                <Sparkles size={14} /> New Job with AI
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('jobs')}
              >
                <Briefcase size={14} /> View All Jobs ({jobs.length})
              </button>
            )}
          </div>
        </header>

        {/* Tab View Container */}
        <div className="tab-view-content">
          {activeTab === 'jobs' ? (
            <JobsTab
              jobs={jobs}
              isLoading={isLoadingJobs}
              onRefresh={loadJobs}
              onDeleteJob={handleDeleteJob}
              onNavigateToChat={() => setActiveTab('chat')}
              onShowToast={showToast}
            />
          ) : (
            <ChatInterface
              currentDraft={currentDraft}
              setCurrentDraft={setCurrentDraft}
              onJobCreated={loadJobs}
              onNavigateToJobs={() => setActiveTab('jobs')}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Global Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              onClick={() => removeToast(toast.id)}
              style={{ cursor: 'pointer' }}
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
              <span>{toast.message}</span>
              <X size={13} style={{ marginLeft: '6px', opacity: 0.7 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
