import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/authStore";
import type {
  AuthTokens,
  Course,
  LessonAttempt,
  LessonDetail,
  LessonSummary,
  ProgressSummary,
  Question,
  QuizResult,
  QuizSubmitPayload,
  RegisterResponse,
  Unit,
  User,
} from "@/types";

// Change this to your machine's IP when testing on a physical device
const BASE_URL = "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach access token ──
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 + token refresh ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(client(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<{ access: string }>(
        `${BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );
      useAuthStore.getState().setTokens(data.access, refreshToken);
      processQueue(null, data.access);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
      }
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── API methods ──

export const api = {
  auth: {
    register: (data: {
      email: string;
      username: string;
      password: string;
      display_name?: string;
    }) => client.post<RegisterResponse>("/auth/register/", data).then((r) => r.data),

    login: (data: { email: string; password: string }) =>
      client.post<AuthTokens>("/auth/login/", data).then((r) => r.data),

    logout: (refresh: string) =>
      client.post("/auth/logout/", { refresh }).catch(() => {}),
  },

  me: {
    get: () => client.get<User>("/me/").then((r) => r.data),

    update: (data: { display_name?: string; avatar_url?: string }) =>
      client.patch<User>("/me/", { profile: data }).then((r) => r.data),

    onboarding: (data: {
      motivation: string;
      current_level: string;
      learning_goal: string;
    }) => client.post<User>("/me/onboarding/", data).then((r) => r.data),
  },

  courses: {
    list: () => client.get<Course[]>("/courses/").then((r) => r.data),
  },

  units: {
    list: (courseId: number) =>
      client.get<Unit[]>(`/courses/${courseId}/units/`).then((r) => r.data),
  },

  lessons: {
    list: (unitId: number) =>
      client
        .get<LessonSummary[]>(`/units/${unitId}/lessons/`)
        .then((r) => r.data),

    get: (lessonId: number) =>
      client.get<LessonDetail>(`/lessons/${lessonId}/`).then((r) => r.data),
  },

  quiz: {
    questions: (lessonId: number) =>
      client
        .get<Question[]>(`/lessons/${lessonId}/quiz/`)
        .then((r) => r.data),

    submit: (lessonId: number, payload: QuizSubmitPayload) =>
      client
        .post<QuizResult>(`/lessons/${lessonId}/quiz/submit/`, payload)
        .then((r) => r.data),
  },

  progress: {
    start: (lessonId: number) =>
      client
        .post<LessonAttempt>(`/lessons/${lessonId}/start/`)
        .then((r) => r.data),

    complete: (lessonId: number) =>
      client
        .post<{ already_completed: boolean; xp_earned: number }>(
          `/lessons/${lessonId}/complete/`
        )
        .then((r) => r.data),

    summary: () =>
      client.get<ProgressSummary>("/progress/summary/").then((r) => r.data),
  },
};
