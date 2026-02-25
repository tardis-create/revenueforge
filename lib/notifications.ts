// Notification utilities for RevenueForge

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  userId?: string
}

export interface NotificationResponse {
  success: boolean
  id?: string
  error?: string
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResponse> {
  // Stub implementation - replace with actual notification service
  console.log('Notification:', payload)
  return { success: true, id: `notif_${Date.now()}` }
}
