import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  getRecentItems: (limit?: number) => RecentlyViewedItem[];
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Remove if already exists
        const filtered = get().items.filter((i) => i.id !== item.id);
        // Add to beginning with timestamp
        const newItems = [
          { ...item, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, 20); // Keep max 20 items
        set({ items: newItems });
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clearAll: () => set({ items: [] }),
      getRecentItems: (limit = 10) => {
        return get().items.slice(0, limit);
      },
    }),
    {
      name: "recently-viewed-storage",
    }
  )
);
