import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { api } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    display_name?: string;
  }) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
  isLoading: false,

  hydrate: async () => {
    try {
      const access = await SecureStore.getItemAsync("accessToken");
      const refresh = await SecureStore.getItemAsync("refreshToken");

      if (access && refresh) {
        set({ accessToken: access, refreshToken: refresh });
        try {
          const user = await api.me.get();
          set({ user, isHydrated: true });
        } catch {
          // Tokens expired and refresh failed — clear state
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isHydrated: true,
          });
        }
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const tokens = await api.auth.login({ email, password });
      await SecureStore.setItemAsync("accessToken", tokens.access);
      await SecureStore.setItemAsync("refreshToken", tokens.refresh);
      set({ accessToken: tokens.access, refreshToken: tokens.refresh });
      const user = await api.me.get();
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const result = await api.auth.register(data);
      await SecureStore.setItemAsync("accessToken", result.tokens.access);
      await SecureStore.setItemAsync("refreshToken", result.tokens.refresh);
      set({
        user: result.user,
        accessToken: result.tokens.access,
        refreshToken: result.tokens.refresh,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    const refresh = get().refreshToken;
    if (refresh) api.auth.logout(refresh);
    SecureStore.deleteItemAsync("accessToken");
    SecureStore.deleteItemAsync("refreshToken");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  setTokens: (access, refresh) => {
    SecureStore.setItemAsync("accessToken", access);
    SecureStore.setItemAsync("refreshToken", refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser: (user) => set({ user }),
}));
