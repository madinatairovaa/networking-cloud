import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/v1/auth/refresh-token`, { refreshToken });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/v1/auth/login', data),
  register: (data: any) => api.post('/v1/auth/register', data),
  verifyOtp: (data: { email: string; code: string; type: string }) => api.post('/v1/auth/verify-otp', data),
  forgotPassword: (email: string) => api.post(`/v1/auth/forgot-password?email=${email}`),
  resetPassword: (data: any) => api.post('/v1/auth/reset-password', data),
  changePassword: (data: any) => api.post('/v1/auth/change-password', data),
  refreshToken: (refreshToken: string) => api.post('/v1/auth/refresh-token', { refreshToken }),
  logout: (refreshToken: string) => api.post(`/v1/auth/logout?refreshToken=${refreshToken}`),
};

// User API
export const userApi = {
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') => api.get(`/v1/users?page=${page}&size=${size}&sort=${sort}`),
  getById: (id: string) => api.get(`/v1/users/${id}`),
  search: (q: string, page = 0) => api.get(`/v1/users/search?q=${q}&page=${page}`),
  getByRole: (role: string, page = 0) => api.get(`/v1/users/role/${role}?page=${page}`),
  create: (data: any) => api.post('/v1/users', data),
  updateStatus: (id: string, status: string) => api.patch(`/v1/users/${id}/status?status=${status}`),
  delete: (id: string) => api.delete(`/v1/users/${id}`),
  restore: (id: string) => api.post(`/v1/users/${id}/restore`),
  updateProfile: (id: string, data: any) => api.put(`/v1/users/${id}/profile`, data),
};

// Product API
export const productApi = {
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') => api.get(`/v1/products?page=${page}&size=${size}&sort=${sort}`),
  getById: (id: string) => api.get(`/v1/products/${id}`),
  search: (q: string, page = 0) => api.get(`/v1/products/search?q=${q}&page=${page}`),
  getByCategory: (categoryId: string, page = 0) => api.get(`/v1/products/category/${categoryId}?page=${page}`),
  getBySeller: (sellerId: string, page = 0) => api.get(`/v1/products/seller/${sellerId}?page=${page}`),
  create: (data: any) => api.post('/v1/products', data),
  update: (id: string, data: any) => api.put(`/v1/products/${id}`, data),
  delete: (id: string) => api.delete(`/v1/products/${id}`),
};

// Order API
export const orderApi = {
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') => api.get(`/v1/orders?page=${page}&size=${size}&sort=${sort}`),
  getMyOrders: (page = 0) => api.get(`/v1/orders/my-orders?page=${page}`),
  getById: (id: string) => api.get(`/v1/orders/${id}`),
  create: (data: any) => api.post('/v1/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/v1/orders/${id}/status?status=${status}`),
};

// Category API
export const categoryApi = {
  getAll: () => api.get('/v1/categories'),
  getRoots: () => api.get('/v1/categories/roots'),
  getById: (id: string) => api.get(`/v1/categories/${id}`),
  create: (data: any) => api.post('/v1/categories', data),
  update: (id: string, data: any) => api.put(`/v1/categories/${id}`, data),
  delete: (id: string) => api.delete(`/v1/categories/${id}`),
};

// Customer API
export const customerApi = {
  getAll: (page = 0, size = 20) => api.get(`/v1/customers?page=${page}&size=${size}`),
  search: (q: string, page = 0) => api.get(`/v1/customers/search?q=${q}&page=${page}`),
  getById: (id: string) => api.get(`/v1/customers/${id}`),
  create: (data: any) => api.post('/v1/customers', data),
  update: (id: string, data: any) => api.put(`/v1/customers/${id}`, data),
  delete: (id: string) => api.delete(`/v1/customers/${id}`),
};

// Warehouse API
export const warehouseApi = {
  getAll: (page = 0, size = 20) => api.get(`/v1/warehouses?page=${page}&size=${size}`),
  getActive: (page = 0) => api.get(`/v1/warehouses/active?page=${page}`),
  getById: (id: string) => api.get(`/v1/warehouses/${id}`),
  create: (data: any) => api.post('/v1/warehouses', data),
  update: (id: string, data: any) => api.put(`/v1/warehouses/${id}`, data),
  toggleActive: (id: string) => api.patch(`/v1/warehouses/${id}/toggle-active`),
  delete: (id: string) => api.delete(`/v1/warehouses/${id}`),
};

// Inventory API
export const inventoryApi = {
  getAll: (page = 0, size = 20) => api.get(`/v1/inventory?page=${page}&size=${size}`),
  getByWarehouse: (warehouseId: string, page = 0) => api.get(`/v1/inventory/warehouse/${warehouseId}?page=${page}`),
  getByProduct: (productId: string, page = 0) => api.get(`/v1/inventory/product/${productId}?page=${page}`),
  getLowStock: (page = 0) => api.get(`/v1/inventory/low-stock?page=${page}`),
  getById: (id: string) => api.get(`/v1/inventory/${id}`),
  create: (data: any) => api.post('/v1/inventory', data),
  update: (id: string, data: any) => api.put(`/v1/inventory/${id}`, data),
  adjustStock: (id: string, adjustment: number) => api.patch(`/v1/inventory/${id}/adjust?adjustment=${adjustment}`),
};

// Notification API
export const notificationApi = {
  getAll: (page = 0, size = 20) => api.get(`/v1/notifications?page=${page}&size=${size}`),
  getUnreadCount: () => api.get('/v1/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/v1/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/v1/notifications/read-all'),
  delete: (id: string) => api.delete(`/v1/notifications/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getAdmin: () => api.get('/v1/dashboard/admin'),
  getManager: () => api.get('/v1/dashboard/manager'),
  getSeller: () => api.get('/v1/dashboard/seller'),
  getUser: () => api.get('/v1/dashboard/user'),
};

// Audit API
export const auditApi = {
  getAll: (page = 0, size = 20) => api.get(`/v1/audit-logs?page=${page}&size=${size}`),
  getByAction: (action: string, page = 0) => api.get(`/v1/audit-logs/action/${action}?page=${page}`),
  getByUser: (userId: string, page = 0) => api.get(`/v1/audit-logs/user/${userId}?page=${page}`),
};

export default api;
