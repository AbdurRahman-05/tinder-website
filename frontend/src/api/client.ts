const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('prism_access_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (options.data && !(options.data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  };

  if (options.data) {
    config.body = options.data instanceof FormData ? options.data : JSON.stringify(options.data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle Token Expiry
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = localStorage.getItem('prism_refresh_token');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          localStorage.setItem('prism_access_token', refreshData.data.accessToken);
          localStorage.setItem('prism_refresh_token', refreshData.data.refreshToken);
          // Retry original request
          headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
          const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            headers: {
              ...headers,
              ...(options.headers as Record<string, string>),
            },
          });
          const retryJson = await retryRes.json();
          if (!retryRes.ok) throw new Error(retryJson.message || 'Request failed');
          return retryJson.data ?? retryJson;
        }
      } catch {
        localStorage.removeItem('prism_access_token');
        localStorage.removeItem('prism_refresh_token');
      }
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = json.message || (json.errors ? JSON.stringify(json.errors) : 'Something went wrong');
    throw new Error(errorMessage);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, data?: any) => apiRequest<T>(endpoint, { method: 'POST', data }),
  put: <T = any>(endpoint: string, data?: any) => apiRequest<T>(endpoint, { method: 'PUT', data }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  upload: <T = any>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, { method: 'POST', data: formData }),
};
