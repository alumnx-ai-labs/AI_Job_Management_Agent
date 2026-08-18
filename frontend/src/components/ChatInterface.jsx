import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Clock,
  RotateCcw,
  Layers,
  ArrowRight,
  HelpCircle,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Check,
} from 'lucide-react';
import { sendChatMessage } from '../services/jobsApi';

const REQUIRED_FIELD_CONFIG = [
  { key: 'title', label: 'Job Title', icon: Briefcase },
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'work_type', label: 'Work Type', icon: Clock },
  { key: 'salary', label: 'Salary', icon: DollarSign },
  { key: 'description', label: 'Description', icon: FileText },
];

const SAMPLE_PROMPTS = [
  {
    label: '⚡ Full Tech Job (All Fields)',
    text: `Job Title: Senior Full-Stack Engineer
Company: Stripe
Location: San Francisco, CA (Hybrid)
Work Type: Full-time
Salary: $175,000 - $210,000 / year
Description: Lead frontend architecture using React, Next.js, and design scalable Node.js payment gateways and API microservices.`,
  },
  {
    label: '⚠️ Partial Job (Missing Salary)',
    text: `We are hiring a Lead DevOps Architect at Netflix based in Remote (US). This is a Full-time role managing Kubernetes infrastructure and high-throughput streaming pipelines.`,
  },
  {
    label: '🌐 Remote Product Designer',
    text: `Company: Figma
Title: Senior Product Designer
Location: Remote
Work Type: Full-time
Salary: $160,000
Description: Design intuitive developer tools and collaborative canvas experiences.`,
  },
];

export default function ChatInterface({
  currentDraft,
  setCurrentDraft,
  onJobCreated,
  onNavigateToJobs,
  onShowToast,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! I am your AI Job Creation Assistant. Paste any complete or partial job description below, and I will extract the structured details (Title, Company, Location, Work Type, Salary, Description) and automatically save it once complete.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestCreatedJob, setLatestCreatedJob] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  // Calculate filled fields count
  const filledCount = REQUIRED_FIELD_CONFIG.filter(
    (f) => currentDraft[f.key] && String(currentDraft[f.key]).trim().length > 0
  ).length;
  const progressPercent = Math.round((filledCount / 6) * 100);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    // Build conversation history format for API
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const data = await sendChatMessage(text, currentDraft, historyPayload);

      // Update draft state with accumulated draft
      if (data.draft) {
        setCurrentDraft(data.draft);
      }

      if (data.status === 'job_created') {
        const botMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'Job created successfully!',
          job: data.job,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setLatestCreatedJob(data.job);
        onShowToast?.(`🎉 Job '${data.job.title}' created successfully!`, 'success');
        onJobCreated?.();
        // Clear draft for next job
        setCurrentDraft({});
      } else {
        // Needs more info
        const botMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'Please provide the missing fields to complete this job.',
          missingFields: data.missing_fields,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to process your request. Please check backend connection.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      onShowToast?.('Failed to process message', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetDraft = () => {
    setCurrentDraft({});
    setLatestCreatedJob(null);
    onShowToast?.('Draft cleared.', 'info');
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversation cleared. Paste a new job description anytime!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentDraft({});
    setLatestCreatedJob(null);
  };

  return (
    <div className="chat-tab-layout">
      {/* Main Chat Panel */}
      <div className="chat-main-panel">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="ai-avatar">
              <Bot size={20} />
            </div>
            <div className="ai-meta">
              <h3>AI Extraction Agent</h3>
              <p>Multi-turn parser with automatic database persistence</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleClearConversation}
              title="Clear conversation"
            >
              <RotateCcw size={14} /> Clear Chat
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="chat-messages-container" id="chat-messages-scroll">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message-row ${msg.role}`}>
              <div className={`message-avatar ${msg.role === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className="message-bubble">
                <div>{msg.content}</div>

                {/* If job was created, show rich success box */}
                {msg.job && (
                  <div className="job-created-card">
                    <div className="job-created-header">
                      <CheckCircle2 size={18} /> Job Created & Stored
                    </div>
                    <div style={{ fontSize: '0.84rem' }}>
                      <strong>{msg.job.title}</strong> at <strong>{msg.job.company}</strong> ({msg.job.location})
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={onNavigateToJobs}
                        style={{ marginTop: '6px' }}
                      >
                        View in Jobs Hub <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="message-time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Thinking / Submitting Indicator */}
          {isSubmitting && (
            <div className="chat-message-row assistant">
              <div className="message-avatar bot-avatar">
                <Bot size={16} />
              </div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Prompts Bar */}
        <div className="quick-prompts-bar">
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> Try Demo:
          </span>
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSendMessage(sample.text)}
              disabled={isSubmitting}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Paste complete or partial job description, or reply with missing fields... (Press Enter to send)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              id="chat-textarea-input"
            />
            <button
              className="send-btn"
              onClick={() => handleSendMessage()}
              disabled={isSubmitting || !inputText.trim()}
              id="chat-submit-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Live Draft Inspector Side Panel */}
      <div className="draft-inspector-panel">
        <div className="inspector-card">
          <div className="inspector-header">
            <div className="inspector-title">
              <Layers size={16} color="var(--primary-light)" />
              Live Draft Status
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleResetDraft}
              title="Reset draft fields"
              style={{ fontSize: '0.74rem', padding: '2px 6px' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completion Status</span>
              <span style={{ fontWeight: 700, color: progressPercent === 100 ? 'var(--success)' : 'var(--primary-light)' }}>
                {filledCount}/6 Fields ({progressPercent}%)
              </span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 ? 'var(--emerald-gradient)' : 'var(--accent-gradient)',
                }}
              />
            </div>
          </div>

          {/* Field Checklist */}
          <div className="field-checklist">
            {REQUIRED_FIELD_CONFIG.map((field) => {
              const val = currentDraft[field.key];
              const isFilled = val && String(val).trim().length > 0;
              const Icon = field.icon;

              return (
                <div
                  key={field.key}
                  className={`field-check-item ${isFilled ? 'filled' : 'missing'}`}
                >
                  <div className={`field-icon ${isFilled ? 'check' : 'clock'}`}>
                    {isFilled ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="field-details">
                    <div className="field-name-row">
                      <span className="field-label">
                        <Icon size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        {field.label}
                      </span>
                      <span className={`field-status-tag ${isFilled ? 'filled' : 'missing'}`}>
                        {isFilled ? 'Extracted' : 'Missing'}
                      </span>
                    </div>
                    <div className={`field-value ${isFilled ? '' : 'empty'}`}>
                      {isFilled ? val : 'Awaiting input...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {progressPercent === 100 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> Ready to save or already persisted!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
