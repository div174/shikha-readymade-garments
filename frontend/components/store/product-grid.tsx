'use client'

import { ProductCard } from '@/components/store/product-card'
import type { Product } from '@/lib/products'
import { SearchX } from 'lucide-react'

export function ProductGrid({ 
  products,
  onProductClick
}: { 
  products: Product[]
  onProductClick?: (product: Product) => void
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <SearchX className="size-8 text-muted-foreground" />
        <p className="font-serif text-lg font-semibold text-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={onProductClick ? () => onProductClick(product) : undefined}
        />
      ))}
    </div>
  )
}
