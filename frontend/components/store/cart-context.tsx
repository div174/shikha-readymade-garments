'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '@/lib/products'

export type CartItem = {
  key: string
  product: Product
  size: string
  color: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (product: Product, size: string, color: string, quantity?: number) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

    function addItem(product: Product, size: string, color: string, quantity: number = 1) {
      const key = `${product.id}-${size}-${color}`
      setItems((prev) => {
        const existing = prev.find((item) => item.key === key)
        if (existing) {
          return prev.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
          )
        }
        return [...prev, { key, product, size, color, quantity }]
      })
    }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key))
  }

  function updateQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(key)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item)),
    )
  }

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )
    return {
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clear: () => setItems([]),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
