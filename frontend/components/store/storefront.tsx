'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CartProvider } from '@/components/store/cart-context'
import { Navbar } from '@/components/store/navbar'
import { Hero } from '@/components/store/hero'
import { Filters, PRICE_MAX } from '@/components/store/filters'
import { ProductGrid } from '@/components/store/product-grid'
import { CartDrawer } from '@/components/store/cart-drawer'
import { CheckoutModal } from '@/components/store/checkout-modal'
import { ProductModal } from '@/components/store/product-modal'
import { products as staticProducts, type Category, type Product } from '@/lib/products'
import { fetchProducts, fetchCategories } from '@/lib/api'
import { MapPin, Phone, Clock } from 'lucide-react'

export function Storefront() {
  const [products, setProducts] = useState<Product[]>(staticProducts)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [selected, setSelected] = useState<Set<Category>>(new Set())
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [search, setSearch] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Fetch products and categories from the API; fall back to static data on error
  useEffect(() => {
    let cancelled = false
    
    // Fetch Categories
    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data.map((c) => c.name))
      })
      .catch(console.error)

    // Fetch Products
    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data.length > 0 ? data : staticProducts)
          setApiError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setApiError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const activeCategory: Category | 'All' =
    selected.size === 1 ? (Array.from(selected)[0] as Category) : 'All'

  function toggleCategory(category: Category) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  function selectFromNav(category: Category | 'All') {
    setSelected(category === 'All' ? new Set() : new Set([category]))
    scrollToGrid()
  }

  function resetFilters() {
    setSelected(new Set())
    setMaxPrice(PRICE_MAX)
    setSearch('')
  }

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const selectedLower = new Set(Array.from(selected).map(c => c.toLowerCase()))
    return products.filter((product) => {
      const matchesCategory = selectedLower.size === 0 || product.categories.some((c) => selectedLower.has(c.toLowerCase()))
      const matchesPrice = product.price <= maxPrice
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.categories.some(c => c.toLowerCase().includes(query)) ||
        product.description.toLowerCase().includes(query)
      return matchesCategory && matchesPrice && matchesSearch
    })
  }, [selected, maxPrice, search, products])

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <Navbar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={selectFromNav}
          search={search}
          onSearchChange={setSearch}
        />

        <main className="flex-1">
          <Hero onShopNow={scrollToGrid} />

          <div ref={gridRef} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 md:px-6">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                Shop our collection
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
              <div className="lg:sticky lg:top-28 lg:h-fit">
                <div className="rounded-xl border border-border bg-card p-5">
                  <Filters
                    categories={categories}
                    selected={selected}
                    onToggleCategory={toggleCategory}
                    maxPrice={maxPrice}
                    onMaxPriceChange={setMaxPrice}
                    onReset={() => {
                      setSelected(new Set())
                      setMaxPrice(PRICE_MAX)
                    }}
                  />
                </div>
              </div>
              <ProductGrid products={filtered} onProductClick={setSelectedProduct} />
            </div>
          </div>
        </main>

        <Footer />

        <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </CartProvider>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="flex flex-col gap-2">
          <span className="font-serif text-lg font-bold text-foreground">Shikha Garments</span>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Your trusted destination for sarees, suits, kurtis and menswear — bringing traditional
            elegance from Modinagar to your doorstep.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span>pillar no 1170, Opposite bhagwan ganj mandi, modinagar, ghaziabad, up</span>
          </span>
          <span className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            +91 8218785491
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Open daily • 10:00 AM – 9:00 PM
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">We accept</span>
          <span>Cash on Delivery</span>
          <span>Razorpay — UPI, Cards, Netbanking &amp; Wallets</span>
          <span className="mt-2 text-xs">
            © {new Date().getFullYear()} Shikha Garments. All rights reserved.
          </span>
        </div>
        
        <div className="md:col-span-3 mt-4 h-64 w-full rounded-xl overflow-hidden border border-border">
          <iframe
            src="https://maps.google.com/maps?q=pillar%20no%201170,%20Opposite%20bhagwan%20ganj%20mandi,%20modinagar,%20ghaziabad,%20up&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </footer>
  )
}
