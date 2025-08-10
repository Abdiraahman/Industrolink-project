export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

export const createSecureRequest = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  return fetch(url, {
    ...options,
    headers: {
      ...securityHeaders,
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    credentials: 'include'
  });
};

export const getCSRFToken = (): string | null => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
};

export const createCSRFRequest = (url: string, options: RequestInit = {}) => {
  const csrfToken = getCSRFToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...securityHeaders,
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers
    },
    credentials: 'include'
  });
};

export const validateResponse = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
      throw new Error('Unauthorized access');
    }
    
    if (response.status === 403) {
      throw new Error('Access forbidden');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
};

export const secureApiCall = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await createSecureRequest(url, options);
  const validatedResponse = await validateResponse(response);
  return validatedResponse.json();
}; 