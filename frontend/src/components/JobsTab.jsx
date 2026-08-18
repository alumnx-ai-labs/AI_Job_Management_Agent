import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function JobsTab({
  jobs = [],
  isLoading,
  onRefresh,
  onDeleteJob,
  onNavigateToChat,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [selectedJob, setSelectedJob] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = jobs.length;
    const remote = jobs.filter(
      (j) =>
        (j.location && j.location.toLowerCase().includes('remote')) ||
        (j.work_type && j.work_type.toLowerCase().includes('remote'))
    ).length;
    const fullTime = jobs.filter(
      (j) => j.work_type && j.work_type.toLowerCase().includes('full')
    ).length;
    const contract = jobs.filter(
      (j) =>
        j.work_type &&
        (j.work_type.toLowerCase().includes('contract') ||
          j.work_type.toLowerCase().includes('part') ||
          j.work_type.toLowerCase().includes('hybrid'))
    ).length;

    return { total, remote, fullTime, contract };
  }, [jobs]);

  // Filtering & Sorting
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search query match
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q) ||
          job.salary?.toLowerCase().includes(q);

        // Work type filter match
        const matchesWorkType =
          workTypeFilter === 'ALL' ||
          job.work_type?.toLowerCase().includes(workTypeFilter.toLowerCase()) ||
          (workTypeFilter === 'REMOTE' &&
            (job.location?.toLowerCase().includes('remote') ||
              job.work_type?.toLowerCase().includes('remote')));

        return matchesSearch && matchesWorkType;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return (b.id || 0) - (a.id || 0);
        if (sortBy === 'OLDEST') return (a.id || 0) - (b.id || 0);
        if (sortBy === 'COMPANY') return (a.company || '').localeCompare(b.company || '');
        if (sortBy === 'TITLE') return (a.title || '').localeCompare(b.title || '');
        return 0;
      });
  }, [jobs, searchQuery, workTypeFilter, sortBy]);

  const handleCopyJob = (job, e) => {
    e?.stopPropagation();
    const text = `Job: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.work_type}\nSalary: ${job.salary}\nDescription:\n${job.description}`;
    navigator.clipboard.writeText(text);
    setCopiedId(job.id);
    onShowToast?.('Job details copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (jobId, e) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setDeletingId(jobId);
      try {
        await onDeleteJob(jobId);
        if (selectedJob?.id === jobId) {
          setSelectedJob(null);
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Recently added';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="jobs-tab-layout">
      {/* Top Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <Briefcase size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Jobs</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <MapPin size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Remote Positions</span>
            <span className="stat-value">{stats.remote}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Building2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Full-Time</span>
            <span className="stat-value">{stats.fullTime}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Layers size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Contract / Hybrid</span>
            <span className="stat-value">{stats.contract}</span>
          </div>
        </div>
      </div>

      {/* Toolbar (Search, Filter, Sort, Actions) */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, company, location, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="job-search-input"
          />
        </div>

        <div className="filter-group">
          <select
            className="select-dropdown"
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            id="work-type-filter"
          >
            <option value="ALL">All Work Types</option>
            <option value="REMOTE">Remote</option>
            <option value="FULL">Full-Time</option>
            <option value="PART">Part-Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="HYBRID">Hybrid</option>
          </select>

          <select
            className="select-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            id="sort-by-select"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="COMPANY">Company (A-Z)</option>
            <option value="TITLE">Title (A-Z)</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="Refresh jobs list"
            disabled={isLoading}
            id="refresh-jobs-btn"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            Refresh
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onNavigateToChat}
            id="add-job-chat-btn"
          >
            <Sparkles size={14} />
            Add via AI Chat
          </button>
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Briefcase size={30} />
          </div>
          <h3 className="empty-state-title">
            {jobs.length === 0 ? 'No job postings yet' : 'No matching jobs found'}
          </h3>
          <p className="empty-state-subtitle">
            {jobs.length === 0
              ? 'Paste any job description in the AI Chat Assistant to automatically parse and store it.'
              : 'Try clearing your search query or changing the filter options.'}
          </p>
          {jobs.length === 0 ? (
            <button className="btn btn-primary" onClick={onNavigateToChat}>
              <Sparkles size={16} /> Open AI Chat Assistant
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setWorkTypeFilter('ALL');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const isRemote =
              job.location?.toLowerCase().includes('remote') ||
              job.work_type?.toLowerCase().includes('remote');
            const isContract =
              job.work_type?.toLowerCase().includes('contract') ||
              job.work_type?.toLowerCase().includes('part');

            return (
              <div
                key={job.id}
                className="job-card"
                onClick={() => setSelectedJob(job)}
                style={{ cursor: 'pointer' }}
                id={`job-card-${job.id}`}
              >
                {/* Header */}
                <div className="job-card-header">
                  <div className="company-avatar">
                    {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                  </div>
                  <div className="job-title-group">
                    <h3 className="job-title" title={job.title}>
                      {job.title}
                    </h3>
                    <div className="job-company">
                      <Building2 size={13} /> {job.company}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="badge-row">
                  <span className="badge badge-location">
                    <MapPin size={12} /> {job.location}
                  </span>

                  <span
                    className={`badge badge-worktype ${
                      isRemote ? 'remote' : isContract ? 'contract' : ''
                    }`}
                  >
                    <Briefcase size={12} /> {job.work_type}
                  </span>

                  <span className="badge badge-salary">
                    <DollarSign size={12} /> {job.salary}
                  </span>
                </div>

                {/* Description Preview */}
                <p className="job-description-preview">{job.description}</p>

                {/* Footer */}
                <div className="job-card-footer">
                  <span className="job-created-time">
                    <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    {formatTime(job.created_at)}
                  </span>

                  <div className="job-card-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => handleCopyJob(job, e)}
                      title="Copy Job Details"
                    >
                      {copiedId === job.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      title="View Details"
                    >
                      <ExternalLink size={13} />
                    </button>

                    <button
                      className="btn btn-danger-ghost btn-sm"
                      onClick={(e) => handleDelete(job.id, e)}
                      disabled={deletingId === job.id}
                      title="Delete Job"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedJob.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {selectedJob.company}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedJob(null)}
                style={{ fontSize: '1.2rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-meta-grid">
                <div className="modal-meta-item">
                  <div className="modal-meta-label">Location</div>
                  <div className="modal-meta-value">{selectedJob.location}</div>
                </div>

                <div className="modal-meta-item">
                  <div className="modal-meta-label">Work Type</div>
                  <div className="modal-meta-value">{selectedJob.work_type}</div>
                </div>

                <div className="modal-meta-item">
                  <div className="modal-meta-label">Salary / Compensation</div>
                  <div className="modal-meta-value" style={{ color: 'var(--success)' }}>
                    {selectedJob.salary}
                  </div>
                </div>

                <div className="modal-meta-item">
                  <div className="modal-meta-label">Date Created</div>
                  <div className="modal-meta-value">{formatTime(selectedJob.created_at)}</div>
                </div>
              </div>

              <div>
                <div className="modal-desc-title">Job Description & Responsibilities</div>
                <div className="modal-desc-box">{selectedJob.description}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={(e) => handleCopyJob(selectedJob, e)}
              >
                <Copy size={15} /> Copy Full Details
              </button>
              <button
                className="btn btn-danger-ghost"
                onClick={(e) => handleDelete(selectedJob.id, e)}
              >
                <Trash2 size={15} /> Delete Job
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedJob(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
