// API configuration for RevenueForge
// The API is deployed as a separate Cloudflare Worker

export const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev'

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${path}`
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

// Re-export notification utilities
export { sendNotification, type NotificationPayload, type NotificationType, type NotificationResponse } from './notifications'