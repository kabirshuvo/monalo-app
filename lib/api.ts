/**
 * Centralized API fetch utility
 * 
 * Features:
 * - Automatic JSON parsing and serialization
 * - NextAuth session cookie handling (credentials: 'include')
 * - Consistent error handling with typed responses
 * - No localStorage tokens—relies on secure, httpOnly session cookies
 * - TypeScript support for request/response types
 * - Reusable across the app
 * 
 * Usage:
 *   // GET
 *   const data = await api.get('/api/users')
 *   
 *   // POST with body
 *   const result = await api.post('/api/users', { name: 'Jane' })
 *   
 *   // With error handling
 *   try {
 *     const user = await api.post('/api/users', { email: 'jane@example.com' })
 *   } catch (error) {
 *     if (error instanceof ApiError) {
 *       console.error(error.status, error.message)
 *     }
 *   }
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiOptions extends RequestInit {
  baseUrl?: string
  headers?: Record<string, string>
}

/**
 * Make an API request with automatic JSON handling and error parsing
 * 
 * @param method HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param url API endpoint path or full URL
 * @param body Optional request body (will be JSON-stringified)
 * @param options Additional fetch options (headers, etc.)
 * @returns Parsed JSON response
 * @throws ApiError on non-2xx status or network error
 */
async function request<T = unknown>(
  method: string,
  url: string,
  body?: unknown,
  options: ApiOptions = {}
): Promise<T> {
  const { baseUrl = '', headers = {}, ...fetchOptions } = options

  const requestUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  const fetchInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies (NextAuth session)
    ...fetchOptions,
    body: body ? JSON.stringify(body) : undefined
  }

  try {
    const response = await fetch(requestUrl, fetchInit)

    // Parse response body
    const contentType = response.headers.get('content-type')
    let data: unknown = null

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else if (response.ok) {
      data = await response.text()
    }

    // Handle error responses
    if (!response.ok) {
      const message =
        (typeof data === 'object' && data !== null && 'message' in data && typeof (data as any).message === 'string'
          ? (data as any).message
          : null) ||
        response.statusText ||
        `HTTP ${response.status}`

      throw new ApiError(response.status, message, data)
    }

    return data as T
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network/parse errors
    if (error instanceof Error) {
      throw new ApiError(0, error.message)
    }

    throw new ApiError(0, 'Unknown error')
  }
}

/**
 * GET request
 */
export const api = {
  async get<T = unknown>(url: string, options?: ApiOptions): Promise<T> {
    return request<T>('GET', url, undefined, options)
  },

  /**
   * POST request
   */
  async post<T = unknown>(url: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>('POST', url, body, options)
  },

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>('PUT', url, body, options)
  },

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>('PATCH', url, body, options)
  },

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, options?: ApiOptions): Promise<T> {
    return request<T>('DELETE', url, undefined, options)
  }
}

export default api
