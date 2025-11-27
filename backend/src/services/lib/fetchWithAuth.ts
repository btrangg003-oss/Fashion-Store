/**
 * Fetch utility with automatic authentication token injection
 */

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Merge headers with Authorization
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Make the fetch request
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  })
}

/**
 * Fetch with auth and automatic JSON parsing
 */
export async function fetchJsonWithAuth<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T; response: Response }> {
  const response = await fetchWithAuth(url, options)
  const data = await response.json()
  return { data, response }
}
