const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
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

  deleteMessage: async (id: number) => {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'DELETE',
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
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return handleResponse<any>(res);
  },

  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { credentials: 'include' });
    return handleResponse<any>(res);
  },

  getCategories: async (type?: string) => {
    const url = type ? `${API_BASE}/categories?type=${type}` : `${API_BASE}/categories`;
    const res = await fetch(url, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  createCategory: async (data: any) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateCategory: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteCategory: async (id: number) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },

  getMedia: async () => {
    const res = await fetch(`${API_BASE}/media`, { credentials: 'include' });
    return handleResponse<any[]>(res);
  },

  deleteMedia: async (id: number) => {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse<any>(res);
  },
};