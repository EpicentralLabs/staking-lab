# Analytics System Setup Guide

## Overview

The analytics system tracks LABS staking activity and xLABS rewards distribution with comprehensive charts and real-time data collection.

## What's Been Added

### 1. Database Schema Extensions
- **DailyAnalytics model**: Tracks daily snapshots of staking and rewards activity
- Extended existing User and GlobalStats models with analytics fields

### 2. Analytics Functions (`src/lib/analytics-stats.ts`)
- `recordStakingActivity()` - Track daily staking/unstaking
- `recordXLabsClaimActivity()` - Track daily xLABS claims
- `createDailyAnalyticsSnapshot()` - Create end-of-day snapshots
- `getLabsStakingChartData()` - Fetch chart data for LABS staking
- `getXLabsRewardsChartData()` - Fetch chart data for xLABS rewards

### 3. Background Service (`src/lib/analytics-service.ts`)
- Automatic daily snapshots every 24 hours
- Data collection every minute
- Automatic cleanup of old data (90 days retention)

### 4. API Endpoints
- `GET /api/analytics/labs-staking?days=30` - LABS staking chart data
- `GET /api/analytics/xlabs-rewards?days=30` - xLABS rewards chart data

### 5. React Hooks (`src/hooks/use-analytics-data.tsx`)
- `useLabsStakingData(days)` - Hook for LABS staking data
- `useXLabsRewardsData(days)` - Hook for xLABS rewards data
- `useAnalyticsData(days)` - Combined hook for both datasets

### 6. Integration Utilities (`src/lib/analytics-integration.ts`)
- `trackStakingTransaction()` - Easy staking tracking
- `trackUnstakingTransaction()` - Easy unstaking tracking
- `trackXLabsClaimTransaction()` - Easy xLABS claim tracking

## Setup Instructions

### 1. Database Migration
Run the Prisma migration to add the new DailyAnalytics table:
```bash
pnpm prisma migrate dev --name add-daily-analytics
```

### 2. Start Analytics Service
Add to your app startup (e.g., in `src/app/layout.tsx` or a separate service):
```typescript
import { startAnalyticsService } from '@/lib/analytics-service'

// Start the analytics service when your app initializes
startAnalyticsService()
```

### 3. Integrate Transaction Tracking
In your staking transaction handlers, add analytics tracking:

```typescript
import { 
  trackStakingTransaction, 
  trackUnstakingTransaction,
  trackXLabsClaimTransaction 
} from '@/lib/analytics-integration'

// After successful stake transaction
await trackStakingTransaction(walletAddress, stakeAmount)

// After successful unstake transaction  
await trackUnstakingTransaction(walletAddress, unstakeAmount)

// After successful xLABS claim
await trackXLabsClaimTransaction(walletAddress, claimAmount)
```

## Configuration

### Data Collection Intervals
Configure in `src/components/constants.tsx`:
- `ANALYTICS_DATA_COLLECTION_INTERVAL`: How often to collect data (default: 1 minute)
- `DAILY_ANALYTICS_SNAPSHOT_INTERVAL`: How often to create daily snapshots (default: 24 hours)
- `ANALYTICS_RETENTION_DAYS`: How long to keep data (default: 90 days)

### Chart Data Range
Charts default to 30 days of data. You can customize this:
```typescript
const { labsStaking, xLabsRewards } = useAnalyticsData(60) // 60 days
```

## Viewing Analytics

Visit `/analytics` to see the interactive charts showing:
- LABS staking activity (daily staked vs unstaked amounts)
- xLABS rewards activity (daily claimed vs pending amounts)

## Manual Operations

### Create Manual Snapshot
```typescript
import { triggerManualSnapshot } from '@/lib/analytics-service'

// Create snapshot for today
await triggerManualSnapshot()

// Create snapshot for specific date
await triggerManualSnapshot('2024-01-15')
```

### Check Service Status
```typescript
import { getAnalyticsServiceStatus } from '@/lib/analytics-service'

const status = getAnalyticsServiceStatus()
console.log('Analytics service running:', status.isRunning)
```

### Cleanup Old Data
```typescript
import { cleanupOldAnalyticsData } from '@/lib/analytics-stats'

// Clean up data older than 30 days
await cleanupOldAnalyticsData(30)
```

## Data Flow

1. **Transaction occurs** → Track with integration utilities
2. **Daily snapshots** → Automatic via background service  
3. **API endpoints** → Serve data to charts
4. **React hooks** → Fetch and cache data
5. **Chart components** → Display interactive visualizations

## Troubleshooting

- **No data in charts**: Ensure analytics service is running and transactions are being tracked
- **Performance issues**: Adjust collection intervals in constants.tsx
- **Old data buildup**: Verify automatic cleanup is working or run manual cleanup

## Next Steps

- Integrate tracking calls in your transaction flows
- Start the analytics service in your app
- Run database migrations
- Visit `/analytics` to see your data!
