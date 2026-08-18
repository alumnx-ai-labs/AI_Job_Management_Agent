const API_BASE_URL = 'http://localhost:8000';

export async function fetchJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Unable to load jobs');
  }
  return response.json();
}

export async function sendChatMessage(message, draft = null, conversation = []) {
  const response = await fetch(`${API_BASE_URL}/jobs/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      draft,
      conversation,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Unable to process chat message');
  }

  return data;
}

export async function deleteJob(jobId) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Unable to delete job');
  }

  return response.json();
}

export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
