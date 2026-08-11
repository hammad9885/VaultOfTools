"use client";

import { api as sharedApi } from "../api";
import {
  ActivityRow,
  AdminSettings,
  CategoryRow,
  ConsultationRow,
  OverviewData,
  Paged,
  PostRow,
  ReviewRow,
  SubmissionRow,
  SubscriberRow,
  TagRow,
  ToolRow,
  UserRow,
} from "./types";

const BASE = "/api/admin";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sharedApi.getAdminToken() || sharedApi.getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    sharedApi.clearAdminToken();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed (${res.status})`) as any;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function qs(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const url = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.set(k, String(v));
  }
  const s = url.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  // Overview / dashboard
  getOverview: () => request<OverviewData>("/overview"),

  // Tools
  getTools: (params?: { search?: string; status?: string; featured?: string; sponsored?: string; page?: number; limit?: number }) =>
    request<Paged<ToolRow>>(`/tools${qs(params)}`),
  createTool: (data: any) => request<ToolRow>("/tools", { method: "POST", body: JSON.stringify(data) }),
  updateTool: (id: string, data: any) => request<ToolRow>(`/tools/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTool: (id: string) => request<{ message: string }>(`/tools/${id}`, { method: "DELETE" }),

  // Users
  getUsers: (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) =>
    request<Paged<UserRow>>(`/users${qs(params)}`),
  createUser: (data: any) => request<UserRow>("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request<UserRow>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: (params?: { search?: string; page?: number; limit?: number }) =>
    request<Paged<CategoryRow>>(`/categories${qs(params)}`),
  createCategory: (data: any) => request<CategoryRow>("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => request<CategoryRow>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),

  // Tags
  getTags: (params?: { search?: string; page?: number; limit?: number }) =>
    request<Paged<TagRow>>(`/tags${qs(params)}`),
  createTag: (data: any) => request<TagRow>("/tags", { method: "POST", body: JSON.stringify(data) }),
  updateTag: (id: string, data: any) => request<TagRow>(`/tags/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTag: (id: string) => request<{ message: string }>(`/tags/${id}`, { method: "DELETE" }),

  // Reviews
  getReviews: (params?: { search?: string; status?: string; rating?: string; page?: number; limit?: number }) =>
    request<Paged<ReviewRow>>(`/reviews${qs(params)}`),
  updateReview: (id: string, data: any) => request<ReviewRow>(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteReview: (id: string) => request<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),

  // Blog posts
  getPosts: (params?: { search?: string; category?: string; page?: number; limit?: number }) =>
    request<Paged<PostRow>>(`/posts${qs(params)}`),
  createPost: (data: any) => request<PostRow>("/posts", { method: "POST", body: JSON.stringify(data) }),
  updatePost: (id: string, data: any) => request<PostRow>(`/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePost: (id: string) => request<{ message: string }>(`/posts/${id}`, { method: "DELETE" }),

  // Submissions
  getSubmissions: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    request<Paged<SubmissionRow>>(`/submissions${qs(params)}`),
  updateSubmission: (id: string, data: any) =>
    request<SubmissionRow>(`/submissions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubmission: (id: string) => request<{ message: string }>(`/submissions/${id}`, { method: "DELETE" }),

  // Subscribers
  getSubscribers: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    request<Paged<SubscriberRow>>(`/subscribers${qs(params)}`),
  createSubscriber: (email: string) => request<SubscriberRow>("/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
  updateSubscriber: (id: string, data: any) =>
    request<SubscriberRow>(`/subscribers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubscriber: (id: string) => request<{ message: string }>(`/subscribers/${id}`, { method: "DELETE" }),

  // Consultations
  getConsultations: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    request<Paged<ConsultationRow>>(`/consultations${qs(params)}`),
  updateConsultation: (id: string, data: any) =>
    request<ConsultationRow>(`/consultations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteConsultation: (id: string) => request<{ message: string }>(`/consultations/${id}`, { method: "DELETE" }),

  // Settings
  getSettings: () => request<AdminSettings & { smtp: any }>("/settings"),
  updateSettings: (data: Partial<AdminSettings>) =>
    request<AdminSettings & { smtp: any }>("/settings", { method: "PUT", body: JSON.stringify(data) }),

  // Activity
  getActivity: (params?: { page?: number; limit?: number }) =>
    request<Paged<ActivityRow>>(`/activity${qs(params)}`),

  // Data tools
  exportCSV: async (type: "tools" | "users" | "subscribers" | "reviews") => {
    const res = await fetch(`${BASE}/export?type=${type}`, {
      headers: { Authorization: `Bearer ${sharedApi.getAdminToken() || sharedApi.getToken() || ""}` },
    });
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    return res.text();
  },
  importToolsCSV: (csv: string) =>
    request<{ imported: number; errors: string[] }>("/import", { method: "POST", body: JSON.stringify({ csv }) }),
  downloadBackup: async () => {
    const res = await fetch(`${BASE}/backup`, {
      headers: { Authorization: `Bearer ${sharedApi.getAdminToken() || sharedApi.getToken() || ""}` },
    });
    if (!res.ok) throw new Error(`Backup failed (${res.status})`);
    return res.text();
  },
};
