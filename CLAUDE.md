# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js)
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm start` - Start production server

### Anchor Program
- `pnpm setup` - Sync program keys and generate TypeScript client
- `pnpm anchor-build` - Build the Solana program
- `pnpm anchor-localnet` - Start test validator with program deployed
- `pnpm anchor-test` - Run Anchor tests
- `pnpm anchor deploy --provider.cluster devnet` - Deploy to Devnet

### Code Generation
- `pnpm codama:js` - Generate TypeScript client from Anchor program

### CI Pipeline
- `pnpm ci` - Run full CI pipeline (build, lint, format check, codama)

## Architecture Overview

This is a full-stack Solana staking application built with:

### Frontend Stack
- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom UI components
- **Gill SDK** (`@gillsdk/react`) for Solana blockchain interactions
- **Wallet-UI** for wallet connection and cluster management
- **React Query** (`@tanstack/react-query`) for data fetching and caching
- **Jotai** for state management
- **Radix UI** for accessible component primitives

### Blockchain Integration
- **Anchor Framework** for Solana program development (Rust)
- **Codama** for generating TypeScript clients from Anchor programs
- **@solana/webcrypto-ed25519-polyfill** for browser compatibility

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── staking/           # Staking interface
│   ├── admin/             # Admin dashboard  
│   └── account/           # Account management
├── components/
│   ├── ui/                # Reusable UI components (Radix-based)
│   ├── staking/           # Staking-specific components
│   ├── admin/             # Admin components
│   ├── shared/            # Shared business logic components
│   └── solana/            # Solana/wallet integration
├── lib/                   # Utilities and business logic
└── tests/                 # Test files

anchor/
├── programs/stakingfrontend/  # Rust Solana program
├── src/                       # Generated TypeScript client
└── tests/                     # Anchor tests
```

### Key Architectural Patterns

**Provider Pattern**: App wrapped in multiple providers:
- `ReactQueryProvider` for server state management
- `ThemeProvider` for dark/light theme switching
- `SolanaProvider` for wallet and cluster configuration

**Data Access Pattern**: Components follow a data-access/feature/UI separation:
- `*-data-access.tsx` - React Query hooks and blockchain interactions
- `*-feature.tsx` - Business logic and state management  
- `*-ui.tsx` - Presentational components

**Wallet Integration**: Uses Wallet-UI library with support for:
- Multiple Solana clusters (localnet, devnet)
- Dynamic wallet provider loading
- Cluster switching via dropdown

**Real-time Updates**: Custom hooks like `use-realtime-pending-rewards.tsx` for live blockchain data

### Solana Program Details
- Program ID: `7XWfye1o2g4aq6bQLKYbZcWJ5YkyJ58XpXSLLm9CM2ig`
- Basic counter program with increment/decrement/set operations
- Account-based storage pattern typical of Solana programs

### Development Workflow
1. Run `pnpm setup` to sync program keys and generate client
2. Start local validator with `pnpm anchor-localnet`
3. Start frontend development server with `pnpm dev`
4. After program changes, rebuild with `pnpm anchor-build` and regenerate client with `pnpm codama:js`

### Testing
- Frontend: Uses Vitest (configured in package.json)
- Anchor: Uses built-in Anchor test framework
- Run tests with `pnpm anchor-test` for Solana program tests

## Development Guidelines

### Backwards Compatibility Policy
NEVER maintain backwards compatibility when refactoring or creating new implementations. If you create new files with improved functionality, ALWAYS delete the old versions completely. Do not keep duplicate implementations or "enhanced" vs "non-enhanced" versions. This keeps the codebase clean and prevents confusion about which version to use.