import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Catalog APIs
export const catalogApi = {
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (slug: string) => api.get(`/products/${slug}`),
  getBanners: (position?: string) => api.get('/banners', { params: position ? { position } : {} }),
}

// Order APIs
export const orderApi = {
  preview: (data: any) => api.post('/orders/preview', data),
  create: (data: any) => api.post('/orders/create', data),
  getOrder: (id: number) => api.get(`/orders/${id}`),
}

// Payment APIs
export const paymentApi = {
  init: (data: any) => api.post('/payments/init', data),
}