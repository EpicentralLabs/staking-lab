# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Solana-based staking application called "Stake LABS" built with Next.js 15 and React 19. Users can stake LABS tokens to earn xLABS rewards. The application features a modular architecture with clean separation between frontend UI and Solana blockchain logic, making it easy to develop and maintain.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture

### Modular Frontend Design
The application follows a clean separation between UI components and Solana blockchain logic:

- **Frontend Stack**: Next.js 15 with App Router, React 19, Tailwind CSS 4, Radix UI
- **Wallet Integration**: Solana Wallet Adapter with auto-connect
- **State Management**: Custom React hooks with TypeScript interfaces
- **UI Components**: Modular, reusable components in `src/components/`
- **Solana Integration**: Abstracted into hook functions marked with `//TODO (pen):`

### Staking Interface Architecture
**Core Hook**: `src/hooks/useStaking.ts`
- Manages all staking state (balances, rewards, pool data)
- Handles loading states and error management
- Auto-updates rewards on page load
- Provides clean interface for UI components

**UI Components**: `src/components/staking/`
- `StakeSection.tsx` - Token staking interface
- `UnstakeSection.tsx` - Token unstaking interface  
- `ClaimRewardsSection.tsx` - Rewards claiming interface
- `StakingStats.tsx` - Pool and account statistics

### Solana Program Integration
- **Program ID**: `HV1trVkZxjaVd4fFPD77gKPdAjvj3WsSzA4wR5oHiLuQ`
- **IDL Location**: `src/programs/staking_program/staking_program.ts`
- **Key Instructions**: stake, unstake, claim rewards, update pending rewards
- **Admin Functions**: create/update/delete stake pool config, create xLabs mint

### Network Configuration
The app supports multiple Solana clusters configured via `NEXT_PUBLIC_SOLANA_CLUSTER`:
- **localnet**: http://127.0.0.1:8899
- **devnet**: https://api.devnet.solana.com (default)
- **mainnet-beta**: https://api.mainnet-beta.solana.com

Token mints vary by network and are defined in `src/lib/constants.ts`.

### Admin Access
Admin panel access is restricted to specific wallet addresses defined in `ADMIN_PANEL_ACCESS_ADDRESS` array in constants.

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/app/admin/` - Admin panel components and page
- `src/components/` - Reusable UI components
  - `src/components/staking/` - Modular staking interface components
  - `src/components/ui/` - Base UI components (buttons, cards, dialogs)
  - `src/components/solana-rpc-methods/` - Solana-specific utilities
- `src/hooks/` - Custom React hooks
  - `useStaking.ts` - Main staking state management hook
  - `use-toast.ts` - Toast notification system
- `src/lib/` - Utility functions and constants
- `src/programs/` - Solana program IDL and types

### Key Components
- `AppWalletProvider`: Wraps app with Solana wallet context
- `AdminPanel`: Manages staking pool configuration and APY settings
- **Staking Interface**: Modular components for stake/unstake/claim operations
- `useStaking` hook: Central state management for all staking operations

## Solana Integration Points

### Required Implementation (marked with `//TODO (pen):`)
All Solana blockchain interactions are abstracted into these 7 functions in `src/hooks/useStaking.ts`:

1. **`fetchUserStakeAccount(userPublicKey)`** - Fetch user's staking data
2. **`fetchPoolData()`** - Get pool configuration and total value locked
3. **`fetchUserTokenBalance(userPublicKey)`** - Get user's LABS token balance
4. **`sendUpdatePendingRewardsTransaction(userPublicKey)`** - Update rewards calculation
5. **`sendStakeTransaction(userPublicKey, amount)`** - Execute stake transaction
6. **`sendUnstakeTransaction(userPublicKey, amount)`** - Execute unstake transaction
7. **`sendClaimRewardsTransaction(userPublicKey)`** - Execute claim rewards transaction

### Expected Behavior
- **Page Load**: Automatically calls `updatePendingRewards` transaction
- **Error Handling**: All functions should throw errors with descriptive messages
- **Return Values**: Functions should return appropriate data types or transaction signatures
- **Loading States**: UI automatically handles loading states during transactions
- **Toast Notifications**: Success/error messages are handled by the hook

### Development Workflow
1. Frontend components work independently without Solana implementation
2. Implement Solana functions one by one in `useStaking.ts`
3. Test each function individually
4. UI will automatically reflect the implemented functionality

### Environment Variables
- `NEXT_PUBLIC_SOLANA_CLUSTER`: Network selection (localnet/devnet/mainnet-beta)

## Expected Claude Behavior

### When Working on Staking Features:
1. **Frontend-First Approach**: Always focus on UI/UX improvements and modular component design
2. **Solana Separation**: Never implement actual Solana transactions - mark with `//TODO (pen):`
3. **Error Handling**: Ensure proper error states and loading indicators
4. **Type Safety**: Use TypeScript interfaces for all data structures
5. **Documentation**: Keep this file updated with any architectural changes

### When Making Changes:
1. Update modular components in `src/components/staking/`
2. Modify the `useStaking` hook for state management changes
3. Ensure UI works without Solana implementation
4. Test with `pnpm dev` and `pnpm lint`
5. Update this CLAUDE.md file if architecture changes