'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, Truck, ShieldCheck } from 'lucide-react'

export function Hero({ onShopNow }: { onShopNow: () => void }) {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="size-3.5" />
            New Arrivals 2026
          </span>
          <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Premium Men's Wear & School Uniforms
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            Discover our curated collection of men's clothing and durable school uniforms — now delivered across India from our store at pillar no 1170, Opposite bhagwan ganj mandi, Modinagar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="px-5" onClick={onShopNow}>
              Shop the collection
            </Button>
            <Button size="lg" variant="outline" className="px-5" onClick={onShopNow}>
              Explore uniforms
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-primary" />
              Fast delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              COD &amp; secure online payment
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm bg-slate-100 flex items-center justify-center min-h-[400px]">
            <img
              src="/images/hero.png"
              alt="Men's wear and school uniforms collection"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:block">
            <p className="font-serif text-2xl font-bold text-primary">New Stock</p>
            <p className="text-xs text-muted-foreground">premium quality clothing</p>
          </div>
        </div>
      </div>
    </section>
  )
}
