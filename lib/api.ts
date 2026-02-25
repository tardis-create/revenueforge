// API configuration for RevenueForge
// The API is deployed as a separate Cloudflare Worker

export const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev'

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}
