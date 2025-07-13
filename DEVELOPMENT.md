# Development Workflow Guide

This document outlines the development workflow, coding standards, and best practices for the Stake LABS application.

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- Git

### Setup
```bash
# Clone and install dependencies
git clone <repository-url>
cd staking-lab
pnpm install

# Start development server
pnpm dev
# Opens at http://localhost:3000 (or 3001 if 3000 is busy)

# Run type checking and linting
pnpm lint
pnpm build  # Type checking included in build
```

## Project Architecture

### Frontend-First Development
This project follows a **frontend-first approach**:
1. **UI Development**: Complete interfaces without backend dependencies
2. **State Management**: Use TypeScript interfaces and mock data
3. **Solana Integration**: Implement blockchain logic in isolated functions
4. **Testing**: Test UI flows independently of blockchain state

### Separation of Concerns

```
Frontend (React/Next.js)     Backend (Solana Program)
├── UI Components           ├── Smart Contract Logic
├── State Management        ├── Account Structures  
├── Error Handling          ├── Instruction Handlers
└── User Experience         └── Program Validation
         │                           │
         └─── Integration Layer ─────┘
              (useStaking hook)
```

## Development Workflow

### 1. Feature Development Process

#### Step 1: UI Design & Implementation
```bash
# Create/modify UI components
src/components/staking/NewFeature.tsx

# Update state management if needed
src/hooks/useStaking.ts

# Test UI independently
pnpm dev
```

#### Step 2: Integration Points
```typescript
// Mark Solana integration points
async function newSolanaFunction() {
  // TODO (pen): Implement Solana logic for new feature
  throw new Error('newSolanaFunction not implemented');
}
```

#### Step 3: Documentation
```bash
# Update component documentation
src/components/staking/README.md

# Update integration guide  
src/hooks/SOLANA_INTEGRATION.md

# Update CLAUDE.md if architecture changes
CLAUDE.md
```

#### Step 4: Testing & Validation
```bash
# Run linting and type checking
pnpm lint

# Manual testing checklist:
# - UI responsiveness
# - Error states
# - Loading states
# - Accessibility
```

### 2. Solana Integration Workflow

#### Step 1: Review Integration Docs
```bash
# Read detailed specifications
cat src/hooks/SOLANA_INTEGRATION.md

# Understand data structures
src/hooks/useStaking.ts  # See TypeScript interfaces
```

#### Step 2: Implement Functions
```typescript
// Replace TODO comments with actual implementation
async function fetchUserStakeAccount(userPublicKey: any): Promise<StakeData> {
  // Your Solana implementation here
}
```

#### Step 3: Test Integration
```bash
# Test with local validator first
solana-test-validator

# Test UI with real Solana functions
pnpm dev
```

#### Step 4: Error Handling
```typescript
// Ensure proper error handling
try {
  const result = await solanaFunction();
  return result;
} catch (error) {
  console.error('Function failed:', error);
  throw new Error('User-friendly error message');
}
```

## Coding Standards

### TypeScript Guidelines

#### Interfaces & Types
```typescript
// Use descriptive interface names
interface StakeTransactionData {
  amount: number;
  timestamp: Date;
  signature: string;
}

// Prefer interfaces over types for object shapes
interface ComponentProps {
  isLoading: boolean;
  onSubmit: (data: FormData) => void;
}

// Use strict typing, avoid 'any'
// If 'any' is required, add eslint-disable comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const solanaData: any = rawResponse;
```

#### Function Documentation
```typescript
/**
 * Calculates projected rewards based on stake amount and APY
 * @param stakeAmount - Amount of LABS tokens to stake
 * @param apy - Annual percentage yield as decimal (0.12 for 12%)
 * @param timeframe - Period in days for calculation
 * @returns Projected xLABS rewards
 */
function calculateProjectedRewards(
  stakeAmount: number,
  apy: number,
  timeframe: number
): number {
  return (stakeAmount * apy * timeframe) / 365;
}
```

### React Component Guidelines

#### Component Structure
```typescript
// 1. Imports (external libraries first, then internal)
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// 2. Interface definitions
interface ComponentProps {
  // Props definition
}

// 3. Component implementation
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 4. State declarations
  const [state, setState] = useState(initialValue);
  
  // 5. Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // 6. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 7. Early returns (loading, error states)
  if (isLoading) return <LoadingSpinner />;
  
  // 8. Main render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}
```

#### Naming Conventions
```typescript
// Components: PascalCase
export function StakeSection() {}

// Hooks: camelCase starting with 'use'
export function useStaking() {}

// Props interfaces: ComponentName + Props
interface StakeSectionProps {}

// Event handlers: handle + Action
const handleStakeSubmit = () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_STAKE_AMOUNT = 1000000;
```

### CSS/Styling Guidelines

#### Tailwind CSS Best Practices
```tsx
// Group utilities logically
<div className="
  flex items-center justify-between  // Layout
  p-4 m-2                           // Spacing
  bg-gray-900 border border-gray-700 // Background & borders
  rounded-lg shadow-lg              // Effects
  hover:bg-gray-800 transition-all  // Interactions
">

// Use responsive prefixes consistently
<div className="
  text-sm sm:text-base md:text-lg   // Mobile-first responsive
  p-2 sm:p-4 md:p-6                 // Consistent breakpoints
">

// Extract complex styles to CSS classes when needed
<div className="staking-card">
```

#### Component-Specific Styles
```css
/* Use CSS modules or styled-components for complex styling */
.staking-card {
  @apply bg-gray-900/20 border border-gray-700/40;
  @apply shadow-lg shadow-black/40 rounded-xl backdrop-blur-xl;
  @apply transition-all duration-300;
  @apply hover:border-blue-500/60 hover:shadow-blue-500/30;
}
```

## Error Handling Standards

### Frontend Error Handling
```typescript
// Use toast notifications for user feedback
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

try {
  await riskyOperation();
  toast({
    title: 'Success',
    description: 'Operation completed successfully',
  });
} catch (error) {
  console.error('Operation failed:', error);
  toast({
    title: 'Error', 
    description: error instanceof Error ? error.message : 'Something went wrong',
    variant: 'destructive',
  });
}
```

### Solana Error Handling
```typescript
// Catch and transform Solana-specific errors
try {
  const signature = await connection.sendTransaction(transaction);
  return signature;
} catch (error) {
  if (error instanceof Error) {
    // Transform technical errors to user-friendly messages
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient SOL balance for transaction fees');
    }
    if (error.message.includes('blockhash not found')) {
      throw new Error('Transaction expired, please try again');
    }
  }
  throw new Error('Transaction failed, please try again');
}
```

## Testing Guidelines

### Manual Testing Checklist

#### UI Testing
- [ ] Component renders correctly on all screen sizes
- [ ] Loading states display properly  
- [ ] Error states show helpful messages
- [ ] Form validation works as expected
- [ ] Buttons disable appropriately during actions
- [ ] Hover and focus states work correctly

#### Accessibility Testing
- [ ] Tab navigation works throughout interface
- [ ] Screen reader compatible (test with browser tools)
- [ ] Color contrast meets WCAG guidelines
- [ ] Error messages are announced properly
- [ ] Form labels are properly associated

#### Integration Testing
- [ ] Wallet connection/disconnection handled gracefully
- [ ] Network switching works correctly
- [ ] Error recovery after failed transactions
- [ ] Data refreshes after successful operations
- [ ] Concurrent operation handling

### Automated Testing (Future)
```typescript
// Example test structure for when tests are added
describe('StakeSection', () => {
  it('disables stake button when amount exceeds balance', () => {
    // Test implementation
  });
  
  it('shows confirmation dialog with correct amount', () => {
    // Test implementation  
  });
});
```

## Performance Guidelines

### React Performance
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Component implementation
});

// Use useCallback for event handlers passed to children
const handleStake = useCallback((amount: number) => {
  stakeTokens(amount);
}, [stakeTokens]);

// Use useMemo for expensive calculations
const projectedRewards = useMemo(() => {
  return calculateComplexRewards(stakeAmount, apy, timeframe);
}, [stakeAmount, apy, timeframe]);
```

### Bundle Size Optimization
```typescript
// Import only what you need
import { Button } from '@/components/ui/button';  // ✅ Good
import * as UI from '@/components/ui';            // ❌ Avoid

// Use dynamic imports for heavy components
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));
```

## Git Workflow

### Commit Message Standards
```bash
# Format: type(scope): description
feat(staking): add unstake functionality
fix(ui): resolve mobile responsive issues  
docs(readme): update setup instructions
refactor(hooks): extract common validation logic
```

### Branch Naming
```bash
# Feature branches
feature/stake-interface
feature/claim-rewards-ui

# Bug fixes  
fix/mobile-responsive-issues
fix/wallet-connection-error

# Documentation
docs/component-documentation
docs/solana-integration-guide
```

### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Implement Changes**: Follow coding standards
3. **Test Thoroughly**: Manual testing checklist
4. **Update Documentation**: README, component docs, CLAUDE.md
5. **Submit PR**: Clear description of changes
6. **Review & Merge**: Address feedback before merging

## Deployment

### Build Process
```bash
# Production build
pnpm build

# Check for errors
pnpm lint

# Test production build locally
pnpm start
```

### Environment Configuration
```bash
# Development
NEXT_PUBLIC_SOLANA_CLUSTER=devnet

# Staging  
NEXT_PUBLIC_SOLANA_CLUSTER=devnet

# Production
NEXT_PUBLIC_SOLANA_CLUSTER=mainnet-beta
```

## Troubleshooting

### Common Issues

#### Development Server Issues
```bash
# Port already in use
pnpm dev  # Will automatically use next available port

# Clear Next.js cache
rm -rf .next
pnpm dev
```

#### TypeScript Errors
```bash
# Check specific files
pnpm tsc --noEmit src/path/to/file.ts

# Full project type check (included in build)
pnpm build
```

#### Wallet Connection Issues
- Ensure wallet extension is installed and unlocked
- Check network configuration matches SOLANA_CLUSTER
- Verify RPC endpoint is accessible

#### Solana Integration Issues
- Check program ID matches deployed program
- Verify account PDAs are calculated correctly
- Ensure proper account permissions and ownership
- Test with local validator first

### Debug Tools

#### Browser DevTools
- React Developer Tools extension
- Network tab for RPC calls
- Console for error messages
- Accessibility tab for a11y testing

#### Solana Tools
```bash
# Check account data
solana account <account-address>

# View transaction details  
solana confirm <transaction-signature>

# Program logs
solana logs <program-id>
```

## Best Practices Summary

### Do's ✅
- Write self-documenting code with clear naming
- Use TypeScript strictly with proper interfaces
- Implement comprehensive error handling
- Test UI flows independently of blockchain
- Update documentation with every change
- Use consistent formatting and linting
- Follow mobile-first responsive design

### Don'ts ❌
- Mix UI logic with Solana transaction code
- Use 'any' type without eslint-disable comment
- Ignore error states or loading indicators
- Skip documentation for new features
- Commit code without running lints
- Hardcode values that should be configurable
- Break the separation between frontend and Solana logic

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Anchor Framework](https://www.anchor-lang.com/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)
- [Solana Explorer](https://explorer.solana.com/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)