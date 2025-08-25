import type { ApiResponse } from '@/types/api';

/**
 * HTTP API client with standardized error handling and response formatting
 * 
 * @example
 * ```typescript
 * const client = new ApiClient('https://api.example.com');
 * const response = await client.get<UserData>('/users/123');
 * if (response.status === 'success') {
 *   console.log(response.data);
 * }
 * ```
 */
export class ApiClient {
  private baseUrl: string;

  /**
   * Creates a new API client instance
   * @param baseUrl - The base URL for all API requests
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Makes an HTTP request and handles errors consistently
   * @param endpoint - The API endpoint (relative to baseUrl)
   * @param options - Fetch options for the request
   * @returns Promise resolving to a standardized API response
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiClientError(
          errorData.code || `HTTP_${response.status}`,
          errorData.message || response.statusText,
          errorData.details
        );
      }

      const data = await response.json();
      
      // Return the response directly since backend now returns the correct format
      return {
        status: 'success',
        data: data,
      };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          status: 'error',
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        };
      }

      return {
        status: 'error',
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param endpoint - The API endpoint
   * @param params - Query parameters to append to the URL
   * @returns Promise resolving to the API response
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      console.log(`🌐 ApiClient GET ${endpoint}:`, JSON.stringify(params, null, 2));
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log(`🔗 Final URL: ${url.pathname + url.search}`);
    return this.request<T>(url.pathname + url.search);
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param endpoint - The API endpoint
   * @param body - The request body data
   * @returns Promise resolving to the API response
   */
  async post<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param endpoint - The API endpoint
   * @param body - The request body data
   * @returns Promise resolving to the API response
   */
  async put<T>(endpoint: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param endpoint - The API endpoint
   * @returns Promise resolving to the API response
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

/**
 * Custom error class for API client errors
 * Extends the base Error class with additional context
 */
export class ApiClientError extends Error {
  public code: string;
  public details?: Record<string, string | number | boolean>;

  constructor(code: string, message: string, details?: Record<string, string | number | boolean>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}