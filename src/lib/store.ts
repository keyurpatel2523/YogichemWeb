import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: number;
  variantName?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            return { items: newItems };
          }
          return { items: [...state.items, { ...item, id: Date.now() }] };
        });
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },
      updateQuantity: (productId, quantity, variantId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

interface WishlistStore {
  items: number[];
  addItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },
      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
);

interface CompareStore {
  items: number[];
  addItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId) => {
        set((state) => {
          if (state.items.length >= 4) return state;
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },
      isInCompare: (productId) => {
        return get().items.includes(productId);
      },
      clearCompare: () => set({ items: [] }),
    }),
    { name: 'compare-storage' }
  )
);

interface UserStore {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isWholesaler: boolean;
    walletBalance: string;
  } | null;
  token: string | null;
  setUser: (user: UserStore['user'], token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => get().token !== null,
    }),
    { name: 'user-storage' }
  )
);
