import { 
  createDailyAnalyticsSnapshot, 
  cleanupOldAnalyticsData,
  syncGlobalPendingStats 
} from './analytics-stats'
import { 
  ANALYTICS_DATA_COLLECTION_INTERVAL,
  DAILY_ANALYTICS_SNAPSHOT_INTERVAL,
  ANALYTICS_RETENTION_DAYS 
} from '@/components/constants'

/**
 * Analytics Service for background data collection
 */

export class AnalyticsService {
  private static instance: AnalyticsService | null = null
  private dataCollectionInterval: NodeJS.Timeout | null = null
  private dailySnapshotInterval: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Start the analytics service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Analytics service is already running')
      return
    }

    console.log('Starting analytics service...')
    this.isRunning = true

    // Start periodic data collection (every minute)
    this.dataCollectionInterval = setInterval(async () => {
      await this.performDataCollection()
    }, ANALYTICS_DATA_COLLECTION_INTERVAL)

    // Start daily snapshot creation (every 24 hours)
    this.dailySnapshotInterval = setInterval(async () => {
      await this.performDailySnapshot()
    }, DAILY_ANALYTICS_SNAPSHOT_INTERVAL)

    // Perform initial data collection and snapshot
    this.performDataCollection()
    this.performDailySnapshot()

    console.log(`Analytics service started with:
      - Data collection interval: ${ANALYTICS_DATA_COLLECTION_INTERVAL / 1000}s
      - Daily snapshot interval: ${DAILY_ANALYTICS_SNAPSHOT_INTERVAL / 1000 / 60 / 60}h
      - Data retention: ${ANALYTICS_RETENTION_DAYS} days`)
  }

  /**
   * Stop the analytics service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Analytics service is not running')
      return
    }

    console.log('Stopping analytics service...')
    
    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval)
      this.dataCollectionInterval = null
    }

    if (this.dailySnapshotInterval) {
      clearInterval(this.dailySnapshotInterval)
      this.dailySnapshotInterval = null
    }

    this.isRunning = false
    console.log('Analytics service stopped')
  }

  /**
   * Check if the service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning
  }

  /**
   * Perform regular data collection tasks
   */
  private async performDataCollection(): Promise<void> {
    try {
      console.log('Analytics: Performing data collection...')
      
      // Sync global pending stats to ensure data consistency
      const syncResult = await syncGlobalPendingStats()
      if (!syncResult.success) {
        console.error('Analytics: Failed to sync global stats:', syncResult.error)
      }

    } catch (error) {
      console.error('Analytics: Error during data collection:', error)
    }
  }

  /**
   * Perform daily snapshot and cleanup tasks
   */
  private async performDailySnapshot(): Promise<void> {
    try {
      console.log('Analytics: Performing daily snapshot...')
      
      // Create daily analytics snapshot
      const snapshotResult = await createDailyAnalyticsSnapshot()
      if (!snapshotResult.success) {
        console.error('Analytics: Failed to create daily snapshot:', snapshotResult.error)
        return
      }

      console.log('Analytics: Daily snapshot created successfully')

      // Clean up old data (keep only last ANALYTICS_RETENTION_DAYS days)
      const cleanupResult = await cleanupOldAnalyticsData(ANALYTICS_RETENTION_DAYS)
      if (!cleanupResult.success) {
        console.error('Analytics: Failed to clean up old data:', cleanupResult.error)
      } else if (cleanupResult.data?.deletedCount > 0) {
        console.log(`Analytics: Cleaned up ${cleanupResult.data.deletedCount} old records`)
      }

    } catch (error) {
      console.error('Analytics: Error during daily snapshot:', error)
    }
  }

  /**
   * Manually trigger a daily snapshot (useful for testing or immediate needs)
   */
  async triggerDailySnapshot(date?: string): Promise<void> {
    console.log('Analytics: Manual daily snapshot triggered')
    const result = await createDailyAnalyticsSnapshot(date)
    if (result.success) {
      console.log('Analytics: Manual snapshot completed successfully')
    } else {
      console.error('Analytics: Manual snapshot failed:', result.error)
    }
  }

  /**
   * Get service status information
   */
  getStatus(): {
    isRunning: boolean
    dataCollectionInterval: number
    dailySnapshotInterval: number
    retentionDays: number
  } {
    return {
      isRunning: this.isRunning,
      dataCollectionInterval: ANALYTICS_DATA_COLLECTION_INTERVAL,
      dailySnapshotInterval: DAILY_ANALYTICS_SNAPSHOT_INTERVAL,
      retentionDays: ANALYTICS_RETENTION_DAYS
    }
  }
}

/**
 * Convenience functions for easier service management
 */

export const analyticsService = AnalyticsService.getInstance()

export function startAnalyticsService(): void {
  analyticsService.start()
}

export function stopAnalyticsService(): void {
  analyticsService.stop()
}

export function getAnalyticsServiceStatus() {
  return analyticsService.getStatus()
}

export function triggerManualSnapshot(date?: string): Promise<void> {
  return analyticsService.triggerDailySnapshot(date)
}
