import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          if (existing.quantity < item.stock) {
            set({
              items: get().items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            });
          }
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
