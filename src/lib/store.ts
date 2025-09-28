import { create } from 'zustand';

interface AppState {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
}));