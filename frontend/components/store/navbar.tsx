'use client'

import { Search, ShoppingBag, Menu, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/store/cart-context'
import { type Category } from '@/lib/products'
import { useState } from 'react'

type NavbarProps = {
  categories: Category[]
  activeCategory: Category | 'All'
  onSelectCategory: (category: Category | 'All') => void
  search: string
  onSearchChange: (value: string) => void
}

export function Navbar({
  categories,
  activeCategory,
  onSelectCategory,
  search,
  onSearchChange,
}: NavbarProps) {
  const { count, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            pillar no 1170, Opposite bhagwan ganj mandi, modinagar, ghaziabad, up
          </span>
          <span>Free delivery on orders above {'\u20B9'}1499 • Cash on Delivery available</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Menu className="size-5" />
        </Button>

        <a href="#" className="flex items-center gap-2.5" aria-label="Shikha Garments home">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground">
            SG
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-bold text-foreground">Shikha Garments</span>
            <span className="text-[11px] tracking-wide text-muted-foreground">
              Ethnic wear since 1998
            </span>
          </span>
        </a>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Categories">
          <CategoryLink
            label="All"
            active={activeCategory === 'All'}
            onClick={() => onSelectCategory('All')}
          />
          {categories.map((category) => (
            <CategoryLink
              key={category}
              label={category}
              active={activeCategory === category}
              onClick={() => onSelectCategory(category)}
            />
          ))}
        </nav>

        <div className="relative ml-auto hidden max-w-xs flex-1 items-center sm:flex">
          <Search
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shirts, trousers, uniforms..."
            aria-label="Search products"
            className="h-9 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <Button
          variant="outline"
          size="lg"
          className="relative ml-auto gap-2 sm:ml-0"
          onClick={openCart}
          aria-label={`Open cart, ${count} items`}
        >
          <ShoppingBag className="size-5" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </Button>
      </div>

      <div className="px-4 pb-3 sm:hidden">
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shirts, trousers, uniforms..."
            aria-label="Search products"
            className="h-9 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border bg-background px-4 py-2 lg:hidden"
          aria-label="Categories mobile"
        >
          <div className="flex flex-wrap gap-2">
            <CategoryLink
              label="All"
              active={activeCategory === 'All'}
              onClick={() => {
                onSelectCategory('All')
                setMobileOpen(false)
              }}
            />
            {categories.map((category) => (
              <CategoryLink
                key={category}
                label={category}
                active={activeCategory === category}
                onClick={() => {
                  onSelectCategory(category)
                  setMobileOpen(false)
                }}
              />
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

function CategoryLink({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-secondary'
      }`}
    >
      {label}
    </button>
  )
}
