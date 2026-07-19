export type Category = string // Just using the name for now to minimize refactoring

export type ProductVariant = {
  id: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  categories: string[];
  price: number;
  mrp: number;
  image: string;
  images: { id: number; image: string }[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
};

export const products: Product[] = []

export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
