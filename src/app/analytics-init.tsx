import { initializeAnalytics } from '@/lib/initialize-analytics'

// Initialize analytics on server startup
initializeAnalytics()

export default function AnalyticsInit() {
  // This is a server component that doesn't render anything
  return null
}
