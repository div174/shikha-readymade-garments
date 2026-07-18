'use client'

import { formatINR, type Category } from '@/lib/products'
import { Button } from '@/components/ui/button'

export const PRICE_MIN = 0
export const PRICE_MAX = 6500

type FiltersProps = {
  categories: Category[]
  selected: Set<Category>
  onToggleCategory: (category: Category) => void
  maxPrice: number
  onMaxPriceChange: (value: number) => void
  onReset: () => void
}

export function Filters({
  categories,
  selected,
  onToggleCategory,
  maxPrice,
  onMaxPriceChange,
  onReset,
}: FiltersProps) {
  return (
    <aside className="flex flex-col gap-6" aria-label="Product filters">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-foreground">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Categories</h3>
        <div className="flex flex-col gap-2">
          {categories.map((category) => {
            const checked = selected.has(category)
            return (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCategory(category)}
                  className="size-4 accent-primary"
                />
                {category}
              </label>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Price range</h3>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          aria-label="Maximum price"
          className="w-full accent-primary"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatINR(PRICE_MIN)}</span>
          <span className="font-medium text-foreground">Up to {formatINR(maxPrice)}</span>
        </div>
      </div>
    </aside>
  )
}
