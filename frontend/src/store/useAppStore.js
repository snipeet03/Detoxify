import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Feed state
      feedResults: null,
      lastQuery: null,
      setFeedResults: (results, query) => set({ feedResults: results, lastQuery: query }),
      clearFeed: () => set({ feedResults: null, lastQuery: null }),

      // Auth state
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('detoxify_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('detoxify_token');
        set({ user: null, token: null });
      },

      // Watch history (local)
      watchHistory: [],
      addToHistory: (video) => {
        const history = get().watchHistory;
        const filtered = history.filter((v) => v.videoId !== video.videoId);
        set({ watchHistory: [{ ...video, watchedAt: new Date().toISOString() }, ...filtered].slice(0, 50) });
      },

      // Bookmarks
      bookmarks: [],
      toggleBookmark: (video) => {
        const bookmarks = get().bookmarks;
        const exists = bookmarks.find((b) => b.videoId === video.videoId);
        set({
          bookmarks: exists
            ? bookmarks.filter((b) => b.videoId !== video.videoId)
            : [video, ...bookmarks],
        });
      },
      isBookmarked: (videoId) => get().bookmarks.some((b) => b.videoId === videoId),
    }),
    {
      name: 'detoxify-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        watchHistory: state.watchHistory,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
