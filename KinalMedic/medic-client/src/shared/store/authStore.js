import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessApp } from "../constants/theme";

const hasAppAccess = (role) => canAccessApp(role);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      checkAuth: () => {
        const token = get().token;
        const role = get().user?.role;
        const allowed = Boolean(token) && hasAppAccess(role);

        if (token && !hasAppAccess(role)) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: "No tienes permisos para acceder a esta aplicación",
          });
          return;
        }

        set({ isAuthenticated: allowed });
      },

      setSession: (token, user) => {
        const normalized = user
          ? {
              ...user,
              id: user.id != null ? String(user.id) : null,
            }
          : null;

        set({
          token,
          user: normalized,
          isAuthenticated: Boolean(token) && hasAppAccess(normalized?.role),
          loading: false,
          error: null,
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),

      patchUser: (partial) => {
        const current = get().user;
        if (!current) return;
        set({
          user: {
            ...current,
            ...partial,
            id:
              partial.id != null
                ? String(partial.id)
                : current.id != null
                  ? String(current.id)
                  : null,
          },
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      },
    }),
    {
      name: "auth-storage-kinal-medic-v2",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Auth rehydrate error:", error);
        }
        useAuthStore.getState().setHasHydrated(true);
        useAuthStore.getState().checkAuth();
      },
    }
  )
);

setTimeout(() => {
  if (!useAuthStore.getState()._hasHydrated) {
    useAuthStore.getState().setHasHydrated(true);
    useAuthStore.getState().checkAuth();
  }
}, 2500);
