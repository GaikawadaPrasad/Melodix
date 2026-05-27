import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      showFullscreen: false,
      activeModal: null,      // 'create-playlist' | 'edit-playlist' | 'add-to-playlist' | 'confirm-delete'
      modalData: null,
      activeView: 'home',    // 'home' | 'search' | 'library' | 'playlist'
      activePlaylistId: null,

      toggleTheme: () => {
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        });
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleFullscreen: () => set((s) => ({ showFullscreen: !s.showFullscreen })),
      openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),
      navigate: (view, playlistId = null) => set({ activeView: view, activePlaylistId: playlistId }),
    }),
    { name: 'melodix-ui', partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }) }
  )
);
