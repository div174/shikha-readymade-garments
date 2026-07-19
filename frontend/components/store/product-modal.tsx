'use client'

import { useEffect, useState } from 'react'
import { X, Check, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/components/store/cart-context'
import { formatINR, type Product } from '@/lib/products'
import { toast } from 'sonner'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '')
  const [mainImage, setMainImage] = useState(product?.image ?? "")

  useEffect(() => {
    if (product) {
      setMainImage(product.image ?? "")
      setSelectedSize(product.sizes[0] || "")
    }
  }, [product])

  if (!product) return null

  const allImages = [product.image, ...(product.images?.map((i) => i.image) ?? [])].filter(Boolean) as string[]
  
  // Get active variant for current size
  const activeVariant = product.variants?.find((v) => v.size === selectedSize)
  const currentPrice = activeVariant ? activeVariant.price : product.price
  const currentMrp = activeVariant && activeVariant.mrp ? activeVariant.mrp : product.mrp
  
  const discount = currentMrp > currentPrice 
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) 
    : 0

  const outOfStock = activeVariant ? activeVariant.stock <= 0 : false

  function handleAddToCart() {
    addItem({ ...product, price: currentPrice, mrp: currentMrp }, selectedSize, 1)
    toast.success(`${product.name} added to cart`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 md:bg-background/80 p-0 md:p-4 backdrop-blur-md md:backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-card shadow-2xl md:max-h-[90vh] md:max-w-4xl md:flex-row md:rounded-2xl border-0 md:border md:border-border transition-all duration-300 animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-background/80 hover:bg-background shadow-sm border border-border transition-colors"
        >
          <X className="size-5" />
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
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
              {product.categories.join(", ")}
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold text-foreground">{formatINR(currentPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatINR(currentMrp)}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            {activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5 && (
              <p className="text-sm text-destructive font-medium mt-1">
                Only {activeVariant.stock} left in stock - order soon!
              </p>
            )}
            {outOfStock && (
              <p className="text-sm text-destructive font-medium mt-1">
                Currently out of stock for this size.
              </p>
            )}
          </div>

          <p className="mb-8 text-base leading-relaxed text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border/50">
            {product.description || 'No description available for this product.'}
          </p>

          <div className="mb-6 flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const variantForSize = product.variants?.find(v => v.size === s);
                const isOutOfStock = variantForSize ? variantForSize.stock <= 0 : false;
                
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    disabled={isOutOfStock}
                    className={`min-w-[3rem] rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                      selectedSize === s
                        ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                        : isOutOfStock
                        ? 'border-border/50 bg-secondary/50 text-muted-foreground/50 cursor-not-allowed line-through'
                        : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`w-full rounded-xl py-4 text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                outOfStock 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <ShoppingCart className="size-5" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
