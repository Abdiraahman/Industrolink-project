// // src/services/api/auth.ts
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   first_name: string;
//   middle_name?: string;
//   last_name: string;
//   username: string;
//   email: string;
//   password: string;
//   role: string;
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   user: {
//     id: number;
//     username: string;
//     email: string;
//     first_name: string;
//     last_name: string;
//     role: string;
//   };
// }

// // Login API call
// export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
//   const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || 'Login failed');
//   }

//   return response.json();
// };

// // Register API call
// export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
//   const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData; // Return full error object for field-specific errors
//   }

//   return response.json();
// };

// // Logout API call
// export const logoutUser = async (refreshToken: string): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ refresh: refreshToken }),
//   });

//   if (!response.ok) {
//     throw new Error('Logout failed');
//   }
// };


















// // src/services/api/auth.ts
// const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   first_name: string;
//   middle_name?: string;
//   last_name: string;
//   username: string;
//   email: string;
//   password: string;
//   role: string;
// }

// export interface AuthResponse {
//   access: string;
//   refresh: string;
//   user: {
//     id: number;
//     username: string;
//     email: string;
//     first_name: string;
//     last_name: string;
//     role: string;
//   };
// }

// export interface ApiError {
//   detail?: string;
//   non_field_errors?: string[];
//   [key: string]: string[] | string | undefined;
// }

// // Base fetch function with error handling
// const apiRequest = async (url: string, options: RequestInit) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}${url}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw {
//         status: response.status,
//         data,
//       };
//     }

//     return data;
//   } catch (error) {
//     if (error instanceof TypeError) {
//       // Network error
//       throw {
//         status: 0,
//         data: { detail: 'Network error. Please check your connection.' },
//       };
//     }
//     throw error;
//   }
// };

// // Login API call
// export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
//   return apiRequest('/api/users/login/', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// };

// // Register API call
// export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
//   return apiRequest('/api/users/register/', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// };

// // Refresh token
// export const refreshToken = async (refreshToken: string): Promise<{ access: string }> => {
//   return apiRequest('/api/users/token/refresh/', {
//     method: 'POST',
//     body: JSON.stringify({ refresh: refreshToken }),
//   });
// };

// // Logout API call
// export const logoutUser = async (refreshToken: string): Promise<void> => {
//   return apiRequest('/users/logout/', {
//     method: 'POST',
//     body: JSON.stringify({ refresh: refreshToken }),
//   });
// };

// // Verify token
// export const verifyToken = async (token: string): Promise<void> => {
//   return apiRequest('/api/users/token/verify/', {
//     method: 'POST',
//     body: JSON.stringify({ token }),
//   });
// };










// src/services/api/auth.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface ApiError {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: string[] | string | undefined;
}

// Base fetch function with error handling
const apiRequest = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data,
      };
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      throw {
        status: 0,
        data: { error: 'Network error. Please check your connection.' },
      };
    }
    throw error;
  }
};

// Login API call - Updated to match your Django endpoint
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  return apiRequest('/api/users/login/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Register API call
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  return apiRequest('/api/users/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Refresh token
export const refreshToken = async (): Promise<{ message: string }> => {
  return apiRequest('/api/users/refresh-token/', {
    method: 'POST',
  });
};

// Logout API call
export const logoutUser = async (): Promise<{ message: string }> => {
  return apiRequest('/api/users/logout/', {
    method: 'POST',
  });
};

// Verify token
export const verifyToken = async (): Promise<void> => {
  return apiRequest('/api/users/token/verify/', {
    method: 'POST',
  });
};