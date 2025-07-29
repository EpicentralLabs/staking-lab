# Staking Components Documentation

This directory contains modular React components for the staking interface. Each component is designed to be self-contained and reusable, with clear separation between UI logic and Solana blockchain interactions.

## Component Overview

### 🎯 Design Principles
- **Modular**: Each component has a single responsibility
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Error-Resilient**: Graceful error handling and loading states

## Components

### `InitializationAlert.tsx`
**Purpose**: Displays initialization status and guides users to properly initialize missing components.

**Props**:
```typescript
interface InitializationAlertProps {
  initializationStatus: InitializationStatus;
  onInitialize?: () => void;
  isInitializing?: boolean;
}
```

**Features**:
- Clear status indication (initialized vs not initialized)
- Lists missing components that need to be created
- Direct link to admin panel for initialization
- Auto-initialization for admin users
- Proper visual feedback with warning/success states

### `StakeSection.tsx`
**Purpose**: Handles token staking interface with amount input and confirmation dialog.

**Props**:
```typescript
interface StakeSectionProps {
  userBalance: number;        // User's available LABS token balance
  isStaking: boolean;         // Whether a stake transaction is in progress
  isPoolActive: boolean;      // Whether the staking pool is active
  onStake: (amount: number) => void; // Callback when user confirms stake
}
```

**Features**:
- Decimal input validation (prevents invalid characters)
- "Max" button to stake entire balance
- Confirmation dialog with transaction details
- Disabled state when pool is inactive or transaction in progress
- Real-time validation feedback

**Usage**:
```tsx
<StakeSection
  userBalance={1000.50}
  isStaking={false}
  isPoolActive={true}
  onStake={(amount) => console.log(`Staking ${amount} LABS`)}
/>
```

### `UnstakeSection.tsx`
**Purpose**: Handles token unstaking interface with amount input and confirmation.

**Props**:
```typescript
interface UnstakeSectionProps {
  stakedAmount: number;       // User's currently staked LABS tokens
  isUnstaking: boolean;       // Whether an unstake transaction is in progress
  isPoolActive: boolean;      // Whether the staking pool is active
  onUnstake: (amount: number) => void; // Callback when user confirms unstake
}
```

**Features**:
- Shows current staked balance
- "Max" button to unstake entire staked amount
- Confirmation dialog with warning about rewards update
- Input validation against staked amount
- Visual distinction from stake section (orange theme)

**Usage**:
```tsx
<UnstakeSection
  stakedAmount={500.25}
  isUnstaking={false}
  isPoolActive={true}
  onUnstake={(amount) => console.log(`Unstaking ${amount} LABS`)}
/>
```

### `ClaimRewardsSection.tsx`
**Purpose**: Displays pending rewards with animated counter and claim functionality.

**Props**:
```typescript
interface ClaimRewardsSectionProps {
  pendingRewards: number;     // Amount of xLABS rewards available to claim
  isClaiming: boolean;        // Whether a claim transaction is in progress
  isPoolActive: boolean;      // Whether the staking pool is active
  onClaim: () => void;        // Callback when user confirms claim
}
```

**Features**:
- Smooth animated number transitions
- Large, prominent reward display
- Automatic disable when no rewards available
- Confirmation dialog with reward amount
- Clear visual hierarchy

**Usage**:
```tsx
<ClaimRewardsSection
  pendingRewards={25.1234}
  isClaiming={false}
  isPoolActive={true}
  onClaim={() => console.log('Claiming rewards')}
/>
```

### `StakingStats.tsx`
**Purpose**: Two statistics components for pool data and account overview.

#### `PoolStats`
**Props**:
```typescript
interface PoolStatsProps {
  totalValueLocked: number;   // Total LABS tokens in the pool
  apy: number;                // Annual percentage yield
  isActive: boolean;          // Pool status indicator
}
```

#### `AccountStats`
**Props**:
```typescript
interface AccountStatsProps {
  userBalance: number;        // Available LABS balance
  stakedAmount: number;       // Staked LABS amount
  totalRewardsEarned: number; // Lifetime xLABS rewards earned
  lastUpdated: Date | null;   // Last update timestamp
}
```

**Features**:
- Consistent card design with hover effects
- Monospace font for numbers
- Color-coded status indicators
- Responsive layout
- Optional timestamp display

**Usage**:
```tsx
<PoolStats
  totalValueLocked={1000000}
  apy={12.5}
  isActive={true}
/>

<AccountStats
  userBalance={1000}
  stakedAmount={500}
  totalRewardsEarned={15.5}
  lastUpdated={new Date()}
/>
```

## Styling Guidelines

### Color Scheme
- **Primary**: `#4a85ff` (blue) for staking actions
- **Secondary**: `orange-400` for unstaking actions
- **Success**: `green-400` for active states
- **Error**: `red-400` for inactive/error states
- **Background**: Gray variations with blur effects

### Responsive Breakpoints
- **Mobile**: Base styles (< 640px)
- **Small**: `sm:` prefix (≥ 640px)
- **Medium**: `md:` prefix (≥ 768px)
- **Large**: `lg:` prefix (≥ 1024px)

### Animation
- **Hover Effects**: Scale and shadow transitions
- **Number Animations**: Smooth easing for reward counters
- **Loading States**: Button text changes and disabled styling

## Error Handling

All components gracefully handle:
- **Invalid Input**: Real-time validation with user feedback
- **Network Issues**: Disabled states during transactions
- **Pool Inactive**: Clear messaging when pool is not operational
- **Zero Balances**: Appropriate messaging for empty states

## Integration with `useStaking` Hook

These components are designed to work seamlessly with the `useStaking` hook:

```tsx
import { useStaking } from '@/hooks/useStaking';
import { StakeSection, UnstakeSection, ClaimRewardsSection } from '@/components/staking';

function StakingInterface() {
  const {
    stakeData,
    poolData,
    userBalance,
    isStaking,
    isUnstaking,
    isClaiming,
    stakeTokens,
    unstakeTokens,
    claimRewards,
  } = useStaking();

  return (
    <>
      <StakeSection
        userBalance={userBalance}
        isStaking={isStaking}
        isPoolActive={poolData.isActive}
        onStake={stakeTokens}
      />
      <UnstakeSection
        stakedAmount={stakeData.stakedAmount}
        isUnstaking={isUnstaking}
        isPoolActive={poolData.isActive}
        onUnstake={unstakeTokens}
      />
      <ClaimRewardsSection
        pendingRewards={stakeData.pendingRewards}
        isClaiming={isClaiming}
        isPoolActive={poolData.isActive}
        onClaim={claimRewards}
      />
    </>
  );
}
```

## Testing Considerations

### Manual Testing
1. **Input Validation**: Try invalid characters, negative numbers, amounts exceeding balance
2. **Loading States**: Verify disabled states during transactions
3. **Responsive Design**: Test on different screen sizes
4. **Accessibility**: Tab navigation and screen reader compatibility

### Edge Cases
- Zero balances
- Very large numbers
- Network disconnection
- Wallet disconnection mid-transaction
- Pool status changes during use

## Future Enhancements

### Potential Improvements
- **Amount Presets**: Quick buttons for 25%, 50%, 75%, 100%
- **Transaction History**: Display recent staking activities
- **APY Calculator**: Show projected earnings based on stake amount
- **Multi-language Support**: Internationalization for error messages
- **Advanced Animations**: More sophisticated number transitions

### Performance Optimizations
- **Memoization**: React.memo for expensive re-renders
- **Debounced Input**: Reduce validation frequency for large inputs
- **Virtual Scrolling**: For transaction history lists
- **Image Optimization**: Lazy loading for any future graphics