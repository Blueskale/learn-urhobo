import { create } from "zustand";

import { api } from "@/services/api";
import type { ProgressSummary } from "@/types";

interface ProgressState {
  summary: ProgressSummary | null;
  completedLessonIds: Set<number>;
  isLoading: boolean;

  fetchSummary: () => Promise<void>;
  markLessonCompleted: (lessonId: number) => void;
  addXP: (amount: number) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  summary: null,
  completedLessonIds: new Set(),
  isLoading: false,

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const summary = await api.progress.summary();
      set({ summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markLessonCompleted: (lessonId) => {
    const ids = new Set(get().completedLessonIds);
    ids.add(lessonId);
    set({ completedLessonIds: ids });
  },

  addXP: (amount) => {
    const summary = get().summary;
    if (summary) {
      set({
        summary: { ...summary, xp_total: summary.xp_total + amount },
      });
    }
  },

  reset: () => set({ summary: null, completedLessonIds: new Set() }),
}));
