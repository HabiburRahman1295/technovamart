import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

// ─── Types ────────────────────────────────────────────────────────────────────
interface User {
  id: number
  email: string
  username: string
  phone: string
  avatar?: string
}

interface CartItem {
  product_id: number
  product_name: string
  price: number
  quantity: number
  image?: string
  slug: string
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User, access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user, access, refresh) => {
        Cookies.set('access_token', access, { expires: 1 })
        Cookies.set('refresh_token', refresh, { expires: 7 })
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)

// ─── Cart Store ───────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (product_id: number) => void
  updateQuantity: (product_id: number, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.product_id === item.product_id)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, item] }))
        }
      },
      removeItem: (product_id) =>
        set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) })),
      updateQuantity: (product_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(product_id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id ? { ...i, quantity } : i
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      totalPrice: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
