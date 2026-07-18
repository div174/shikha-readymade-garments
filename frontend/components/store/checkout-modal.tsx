'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, CheckCircle2, Banknote, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/store/cart-context'
import { formatINR } from '@/lib/products'
import { createOrder } from '@/lib/api'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '@/components/store/cart-drawer'

type CheckoutModalProps = {
  open: boolean
  onClose: () => void
}

type Payment = 'cod' | 'upi'

type Errors = Partial<Record<'name' | 'phone' | 'address' | 'pincode', string>>

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clear } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [payment, setPayment] = useState<'cod'>('cod')
  const [errors, setErrors] = useState<Errors>({})
  const [placed, setPlaced] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) return null

  function validate(): boolean {
    const next: Errors = {}
    if (name.trim().length < 2) next.name = 'Please enter your full name.'
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      next.phone = 'Enter a valid 10-digit mobile number.'
    if (address.trim().length < 5) next.address = 'Please enter a complete delivery address.'
    if (!/^\d{6}$/.test(pincode.trim())) next.pincode = 'Pincode must be exactly 6 digits.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setApiError(null)

    try {
      await createOrder({
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        payment_method: (payment === 'cod' ? 'COD' : 'Razorpay') as "COD" | "Razorpay",
        items: items.map((item) => ({
          product: Number(item.product.id),
          quantity: item.quantity,
          size: item.size,
        })),
      })
      setPlaced(true)
      clear()
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Order failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setPlaced(false)
    setErrors({})
    setApiError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-background shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-lg font-bold text-foreground">
            {placed ? 'Order confirmed' : 'Checkout'}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close checkout" onClick={handleClose}>
            <X className="size-5" />
          </Button>
        </div>

        {placed ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CheckCircle2 className="size-14 text-primary" />
            <h3 className="font-serif text-xl font-bold text-foreground">Thank you, {name.split(' ')[0]}!</h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your order has been placed successfully with Cash on Delivery. We&apos;ll deliver to pincode {pincode} shortly.
            </p>
            <Button className="mt-2" onClick={handleClose}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto" noValidate>
            <div className="flex flex-col gap-4 px-5 py-4">
              <Field label="Full name" error={errors.name}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={inputClass(!!errors.name)}
                />
              </Field>

              <Field label="Phone number" error={errors.phone}>
                <div className="flex items-center">
                  <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-secondary px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    className={`${inputClass(!!errors.phone)} rounded-l-none`}
                  />
                </div>
              </Field>

              <Field label="Delivery address" error={errors.address}>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="House no, street, area, city"
                  className={`${inputClass(!!errors.address)} h-auto resize-none py-2`}
                />
              </Field>

              <Field label="Pincode" error={errors.pincode}>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  placeholder="6-digit pincode"
                  className={inputClass(!!errors.pincode)}
                />
              </Field>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-medium text-foreground">Payment method</legend>
                <PaymentOption
                  active={true}
                  onClick={() => {}}
                  icon={<Banknote className="size-5" />}
                  title="Cash on Delivery"
                  subtitle="Pay in cash when your order arrives"
                />
              </fieldset>
              


            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <dl className="mb-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Items ({items.reduce((s, i) => s + i.quantity, 0)})</dt>
                  <dd className="text-foreground">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Delivery</dt>
                  <dd className="text-foreground">
                    {deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
                  </dd>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground">
                  <dt>Total payable</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              {apiError && (
                <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {apiError}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={items.length === 0 || submitting}>
                {submitting ? (
                  <><Loader2 className="size-4 animate-spin" /> Placing order…</>
                ) : (
                  `Place order • ${formatINR(total)}`
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 ${
    hasError ? 'border-destructive' : 'border-input focus-visible:border-ring'
  }`
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  )
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-full ${
          active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
        }`}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span
        className={`flex size-4 items-center justify-center rounded-full border-2 ${
          active ? 'border-primary' : 'border-border'
        }`}
      >
        {active && <span className="size-2 rounded-full bg-primary" />}
      </span>
    </button>
  )
}
