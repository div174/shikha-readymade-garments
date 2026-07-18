'use client'

import { useState } from 'react'
import { Star, Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/store/cart-context'
import { formatINR, type Product } from '@/lib/products'

export function ProductCard({ product, onClick }: { product: Product; onClick?: () => void }) {
  const { addItem } = useCart()
  const [size, setSize] = useState(product.sizes[0] || 'Free Size')
  const [color, setColor] = useState(product.colors[0].name)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

  const allImages = []
  if (product.image) allImages.push(product.image)
  if (product.images && product.images.length > 0) {
    allImages.push(...product.images.map((img) => img.image))
  }

  function handleAdd() {
    addItem(product, size, color, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
    setQuantity(1)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary group/carousel">
        <div 
          className="h-full w-full cursor-pointer"
          onClick={onClick}
        >
          {allImages.length > 0 ? (
            <img
              src={allImages[imgIndex]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground transition-transform duration-300 group-hover:scale-105">
              <span className="font-serif text-4xl font-bold opacity-10">SG</span>
            </div>
          )}
        </div>
        
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity hover:bg-background group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity hover:bg-background group-hover/carousel:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 left-0 flex w-full justify-center gap-1.5">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`size-1.5 rounded-full transition-colors ${
                    idx === imgIndex ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {product.categories.join(", ")}
            </p>
            <h3 
              className="font-serif text-base font-semibold text-foreground cursor-pointer hover:underline"
              onClick={onClick}
            >
              {product.name}
            </h3>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{formatINR(product.price)}</span>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Size</span>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`min-w-9 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  size === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">
            Colour: <span className="text-muted-foreground">{color}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-label={`Select colour ${c.name}`}
                aria-pressed={color === c.name}
                className={`flex size-6 items-center justify-center rounded-full border-2 transition-transform ${
                  color === c.name ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {color === c.name && <Check className="size-3 text-primary-foreground" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              -
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              +
            </button>
          </div>
          <Button className="flex-1 gap-1.5" size="lg" onClick={handleAdd}>
            {added ? (
              <>
                <Check className="size-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add to cart
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  )
}
