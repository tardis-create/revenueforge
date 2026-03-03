// API configuration for RevenueForge
export const API_BASE_URL = 'https://revenueforge-api.pronitopenclaw.workers.dev'

export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('token') || ''
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = getToken()
  const url = `${API_BASE_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
}

export { sendNotification, type NotificationPayload, type NotificationType, type NotificationResponse } from './notifications'
