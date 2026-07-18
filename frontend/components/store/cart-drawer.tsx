'use client'

import { useEffect } from 'react'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/store/cart-context'
import { formatINR } from '@/lib/products'

export const FREE_DELIVERY_THRESHOLD = 1499
export const DELIVERY_FEE = 0

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart()

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  const amountToFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
            <ShoppingBag className="size-5 text-primary" />
            Your Cart
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close cart" onClick={closeCart}>
            <X className="size-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="font-serif text-lg font-semibold text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some beautiful ethnic wear to get started.
            </p>
            <Button className="mt-2" onClick={closeCart}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="mb-4 rounded-lg bg-accent/30 px-3 py-2 text-xs text-accent-foreground">
                  Add {formatINR(amountToFree)} more to get{' '}
                  <span className="font-semibold">free delivery</span>.
                </p>
              )}
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3">
                    <img
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name}
                      className="size-20 shrink-0 rounded-lg border border-border object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="flex size-7 items-center justify-center text-foreground hover:bg-secondary"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="flex size-7 items-center justify-center text-foreground hover:bg-secondary"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-4">
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd className="text-foreground">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Delivery</dt>
                  <dd className={deliveryFee === 0 ? 'font-medium text-primary' : 'text-foreground'}>
                    {deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
                  </dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <dt>Total</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              <Button className="mt-4 w-full" size="lg" onClick={onCheckout}>
                Proceed to checkout
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
