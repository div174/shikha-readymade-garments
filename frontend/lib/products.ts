export type Category = string // Just using the name for now to minimize refactoring

export type Product = {
  id: string
  name: string
  categories: Category[]
  price: number
  mrp: number
  image: string
  images?: { id: number; image: string }[]
  description: string
  sizes: string[]
  colors: { name: string; hex: string }[]
}

export const products: Product[] = []

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
