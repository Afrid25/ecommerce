import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  checkoutItems: CartItem[];
  wishlist: Omit<CartItem, "quantity">[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  startBuyNow: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  clearCheckoutItems: () => void;
  toggleWishlist: (item: Omit<CartItem, "quantity">) => void;
  isWishlisted: (id: number) => boolean;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      checkoutItems: [],
      wishlist: [],
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
      startBuyNow: (item, quantity = 1) =>
        set({
          checkoutItems: [
            {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stock)),
            },
          ],
        }),
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
      clearCheckoutItems: () => set({ checkoutItems: [] }),
      toggleWishlist: (item) => {
        const exists = get().wishlist.some((entry) => entry.id === item.id);
        set({
          wishlist: exists
            ? get().wishlist.filter((entry) => entry.id !== item.id)
            : [...get().wishlist, item],
        });
      },
      isWishlisted: (id) => get().wishlist.some((item) => item.id === id),
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
