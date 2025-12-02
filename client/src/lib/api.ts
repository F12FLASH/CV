const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Request failed");
  }
  return res.json();
}


export const api = {
  // Upload
  uploadImage: async (imageData: string, filename?: string) => {
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData, filename }),
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<{ user: any }>(res);
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse<any>(res);
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<any>(res);
  },

  register: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: any }>(res);
  },

  getProjects: async (published = false) => {
    const url = published ? `${API_BASE}/projects?published=true` : `${API_BASE}/projects`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  getProject: async (id: number) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  createProject: async (data: any) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateProject: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteProject: async (id: number) => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getPosts: async (published = false) => {
    const url = published ? `${API_BASE}/posts?published=true` : `${API_BASE}/posts`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  getPost: async (id: number | string) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  createPost: async (data: any) => {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updatePost: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deletePost: async (id: number) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  getUser: async (id: number) => {
    const res = await fetch(`${API_BASE}/users/${id}`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  updateUser: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteUser: async (id: number) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getMessages: async (unread = false) => {
    const url = unread ? `${API_BASE}/messages?unread=true` : `${API_BASE}/messages`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  getMessage: async (id: number) => {
    const res = await fetch(`${API_BASE}/messages/${id}`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  createMessage: async (data: any) => {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  markMessageAsRead: async (id: number) => {
    const res = await fetch(`${API_BASE}/messages/${id}/read`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  archiveMessage: async (id: number) => {
    const res = await fetch(`${API_BASE}/messages/${id}/archive`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  deleteMessage: async (id: number) => {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  deleteComment: async (id: number) => {
    const res = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  markCommentAsRead: async (id: number) => {
    const res = await fetch(`${API_BASE}/comments/${id}/read`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  archiveComment: async (id: number) => {
    const res = await fetch(`${API_BASE}/comments/${id}/archive`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  deleteReview: async (id: number) => {
    const res = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  markReviewAsRead: async (id: number) => {
    const res = await fetch(`${API_BASE}/reviews/${id}/read`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  archiveReview: async (id: number) => {
    const res = await fetch(`${API_BASE}/reviews/${id}/archive`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getSkills: async () => {
    const res = await fetch(`${API_BASE}/skills`, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  createSkill: async (data: any) => {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateSkill: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteSkill: async (id: number) => {
    const res = await fetch(`${API_BASE}/skills/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getServices: async (active = false) => {
    const url = active ? `${API_BASE}/services?active=true` : `${API_BASE}/services`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  createService: async (data: any) => {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateService: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteService: async (id: number) => {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getTestimonials: async (active = false) => {
    const url = active ? `${API_BASE}/testimonials?active=true` : `${API_BASE}/testimonials`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  createTestimonial: async (data: any) => {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateTestimonial: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteTestimonial: async (id: number) => {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getActivityLogs: async (limit = 50) => {
    const res = await fetch(`${API_BASE}/activity-logs?limit=${limit}`, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  getNotifications: async (userId?: number) => {
    const url = userId ? `${API_BASE}/notifications?userId=${userId}` : `${API_BASE}/notifications`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  markNotificationAsRead: async (id: number) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`, { credentials: 'include' });
    return handleResponse<Record<string, any>>(res);
  },

  getSetting: async (key: string) => {
    const res = await fetch(`${API_BASE}/settings/${key}`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  updateSettings: async (settings: Record<string, any>) => {
    console.log("API: Updating settings with:", settings);
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Save failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  sendTestEmail: async (data: { to: string; subject: string; body: string }) => {
    const res = await fetch("/api/email/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to send test email");
    }
    return res.json();
  },

  // Logging API
  async getLogs(level?: string, limit?: number) {
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    if (limit) params.append("limit", limit.toString());
    return apiRequest(`/api/logs?${params.toString()}`);
  },

  async exportLogs() {
    const response = await fetch("/api/logs/export", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to export logs");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Database Backup API
  async createBackup() {
    return apiRequest("/api/database/backup", {
      method: "POST",
    });
  },

  async restoreBackup(file: File) {
    const formData = new FormData();
    formData.append("backup", file);
    return apiRequest("/api/database/restore", {
      method: "POST",
      body: formData,
    });
  },

  // Performance API
  async clearCache() {
    return apiRequest("/api/performance/clear-cache", {
      method: "POST",
    });
  },

  // Storage API
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/api/storage/upload", {
      method: "POST",
      body: formData,
    });
  },
};