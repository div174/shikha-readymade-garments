'use client'

import { useEffect, useState } from 'react'
import { X, Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/store/cart-context'
import { formatINR, type Product } from '@/lib/products'

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  const { addItem } = useCart()
  const [size, setSize] = useState(product?.sizes[0] || 'Free Size')
  const [color, setColor] = useState(product?.colors[0]?.name || '')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [mainImage, setMainImage] = useState(product?.image)

  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] || 'Free Size')
      setColor(product.colors[0]?.name || '')
      setQuantity(1)
      setMainImage(product.image)
    }
  }, [product])

  if (!product) return null

  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
  
  // Combine main image with gallery images
  const allImages = []
  if (product.image) allImages.push(product.image)
  if (product.images && product.images.length > 0) {
    allImages.push(...product.images.map(img => img.image))
  }

  function handleAdd() {
    addItem(product!, size, color, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
    setQuantity(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:flex-row">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-background/50 hover:bg-background"
        >
          <X className="size-4" />
        </button>

        <div className="flex w-full flex-col bg-secondary md:w-1/2">
          <div className="relative aspect-[3/4] w-full overflow-hidden group/modal-carousel">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <span className="font-serif text-6xl font-bold opacity-10">SG</span>
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = allImages.indexOf(mainImage);
                    const newIdx = currentIdx > 0 ? currentIdx - 1 : allImages.length - 1;
                    setMainImage(allImages[newIdx]);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 transition-opacity hover:bg-background group-hover/modal-carousel:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = allImages.indexOf(mainImage);
                    const newIdx = currentIdx < allImages.length - 1 ? currentIdx + 1 : 0;
                    setMainImage(allImages[newIdx]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 transition-opacity hover:bg-background group-hover/modal-carousel:opacity-100"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    mainImage === img ? 'border-primary' : 'border-transparent hover:border-border'
                  }`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col overflow-y-auto p-6 md:w-1/2 md:p-8">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.categories.join(", ")}
            </p>
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              {product.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{formatINR(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="mb-6 flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-12 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
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

          <div className="mb-8 flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Colour: <span className="text-muted-foreground">{color}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={`Select colour ${c.name}`}
                  aria-pressed={color === c.name}
                  className={`flex size-8 items-center justify-center rounded-full border-2 transition-transform ${
                    color === c.name ? 'border-primary' : 'border-border hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.name && <Check className="size-4 text-primary-foreground" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 pt-6">
            <div className="flex h-12 items-center rounded-md border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 h-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                -
              </button>
              <span className="w-8 text-center text-base font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 h-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                +
              </button>
            </div>
            <Button className="flex-1 gap-2 h-12 text-base" onClick={handleAdd}>
              {added ? (
                <>
                  <Check className="size-5" />
                  Added to cart
                </>
              ) : (
                <>
                  <Plus className="size-5" />
                  Add to cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
