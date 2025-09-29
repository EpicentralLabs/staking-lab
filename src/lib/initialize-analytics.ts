import { startAnalyticsService } from './analytics-service'

// This will be initialized on server startup
let analyticsInitialized = false

export function initializeAnalytics() {
  if (analyticsInitialized) {
    console.log('Analytics service already initialized')
    return
  }

  // Only start analytics service on the server side
  if (typeof window === 'undefined') {
    console.log('Initializing analytics service...')
    startAnalyticsService()
    analyticsInitialized = true
  }
}
