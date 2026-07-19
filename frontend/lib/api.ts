/**
 * Thin fetch-based API client for the Django backend.
 *
 * In development the Django dev server runs at http://127.0.0.1:8000.
 * Override via NEXT_PUBLIC_API_BASE env var in production.
 */

import type { Product, ProductVariant } from "@/lib/products";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://shikha-readymade-garments.onrender.com/api/";

/* ---------- types for the raw backend response ---------- */

type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: string; // DRF sends decimals as strings
  mrp: string | null;
  stock: number;
  categories: BackendCategory[];
  sizes: string;
  image: string | null;
  images: { id: number; image: string }[];
  variants: { id: number; size: string; price: string; mrp: string | null; stock: number }[];
  available_for_delivery: boolean;
  created_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/* ---------- helpers ---------- */

/** Map a backend product to the frontend Product shape. */
function toFrontendProduct(bp: BackendProduct): Product {
  const price = parseFloat(bp.price);
  const mrp = bp.mrp ? parseFloat(bp.mrp) : price;
  return {
    id: String(bp.id),
    name: bp.name,
    categories: bp.categories?.map((c) => c.name) ?? [],
    price,
    mrp,
    image: bp.image ?? "",
    images: bp.images ?? [],
    description: bp.description,
    sizes: bp.sizes ? bp.sizes.split(",").map((s) => s.trim()).filter(Boolean) : ["Free Size"],
    colors: [{ name: "Default", hex: "#7a1f2b" }],
    variants: bp.variants?.map(v => ({
      id: String(v.id),
      size: v.size,
      price: parseFloat(v.price),
      mrp: v.mrp ? parseFloat(v.mrp) : parseFloat(v.price),
      stock: v.stock
    })) || []
  };
}

/* ---------- public API ---------- */

export type BackendCategory = {
  id: number;
  name: string;
  slug: string;
};

/** Fetch all categories */
export async function fetchCategories(): Promise<BackendCategory[]> {
  const res = await fetch(`${API_BASE}categories/`);
  if (!res.ok) throw new Error(`Categories API ${res.status}`);
  // Our backend uses ModelViewSet without pagination for categories, or if paginated, we should handle it
  // Actually, standard ViewSets are paginated if pagination is set globally. Let's handle paginated or unpaginated.
  const data = await res.json();
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  return data;
}

/** Fetch all products (follows pagination automatically). */
export async function fetchProducts(): Promise<Product[]> {
  const all: BackendProduct[] = [];
  let url: string | null = `${API_BASE}products/`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Products API ${res.status}`);
    const data: PaginatedResponse<BackendProduct> = await res.json();
    all.push(...data.results);
    url = data.next;
  }

  return all.map(toFrontendProduct);
}

/** Payload the checkout form sends. */
export type CreateOrderPayload = {
  customer_name: string;
  phone: string;
  address: string;
  pincode: string;
  payment_method: "COD" | "Razorpay";
  items: { product: number; quantity: number; size: string }[];
};

let cachedCsrfToken: string | null = null;

export async function fetchCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch(`${API_BASE}csrf/`, { credentials: "omit" });
    if (res.ok) {
      // Django sets csrftoken in cookies, but browsers may block third-party cookies.
      // So in a decoupled setup, we'd ideally read it from cookies or headers, 
      // but if we are on same domain we can read document.cookie.
      // However, we are on different domains. For now, we will rely on standard credentials.
      // This is a complex topic for Vercel->Render. Let's send a basic token if it's there.
    }
  } catch (e) {
    console.error("Failed to fetch CSRF", e);
  }
}

/** Create an order on the backend. */
export async function createOrder(payload: CreateOrderPayload) {
  // await fetchCsrfToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  // Get csrftoken from document cookies if present
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    if (match) headers['X-CSRFToken'] = match[2];
  }

  const res = await fetch(`${API_BASE}orders/create/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    // DRF may return field-level errors as an object or a single { error: "..." }
    const message =
      typeof data === "object" && data !== null
        ? data.error ?? JSON.stringify(data)
        : String(data);
    throw new Error(message);
  }
  return data;
}
