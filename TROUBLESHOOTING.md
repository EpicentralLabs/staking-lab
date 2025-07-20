# Staking Lab Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot update rewards: Missing required components - xLABS Reward Mint, Stake Pool"

**Issue**: The staking pool components are not initialized, preventing any staking operations.

**Root Cause**: The stake pool requires three core components to be created in a specific order:
1. Stake Pool Config
2. xLABS Reward Mint  
3. Stake Pool

**Solution**:
1. **For Admins**: Navigate to `/admin` and initialize components in the correct order:
   - First: Create Stake Pool Config
   - Second: Create xLABS Mint
   - Third: Create Stake Pool

2. **For Users**: Contact an admin to initialize the staking pool components.

### 2. Cannot Stake Tokens

**Possible Causes**:
- Pool not initialized (see issue #1)
- Insufficient token balance
- Wallet not connected
- Token account doesn't exist

**Solutions**:
- Ensure wallet is connected
- Check LABS token balance
- For admins: Initialize missing components via Admin Panel
- Wait for any pending transactions to complete

### 3. Admin Panel Access Denied

**Issue**: Users see "Access Denied" screen when visiting `/admin`

**Cause**: Only specific wallet addresses have admin privileges.

**Current Admin Addresses**:
- `3zxtSkehQA7Dtknwkt95FMnp4h4MDWYHM1epj9xeRsof`
- `3sNBfwUbxx7LAibq2CpN8zSQsvocnuGCJ9ivACRH6Vkg`
- `8C9yaHEhc348upam4mJuY554ZvjrnmBsftcYTuRGZ4bT`

**Solution**: Connect with one of the approved admin wallets.

### 4. Transaction Failures

**Common Causes**:
- Insufficient SOL for transaction fees
- Network congestion
- Program account not found
- Token account creation needed

**Solutions**:
- Ensure wallet has sufficient SOL for fees (~0.01 SOL)
- Wait and retry if network is congested
- For missing token accounts, the system will auto-create them

### 5. "Stake Pool Not Initialized" Warning

**What This Means**: The staking system is missing one or more required components.

**User Action**: Click "Open Admin Panel" button to access initialization tools (admin only).

**Admin Action**: Follow the initialization steps in the correct order.

## Initialization Steps for Admins

### Prerequisites
- Admin wallet connected
- Sufficient SOL for transaction fees
- Network connectivity

### Step-by-Step Process

1. **Navigate to Admin Panel** (`/admin`)

2. **Create Stake Pool Config**
   - Click "Create Stake Pool Config"
   - This sets up basic pool parameters and APY settings
   - Wait for transaction confirmation

3. **Create xLABS Mint**
   - Click "Create xLABS Mint"  
   - This creates the reward token that stakers will earn
   - Wait for transaction confirmation

4. **Create Stake Pool**
   - Click "Create Stake Pool"
   - This creates the main staking contract and vault
   - Wait for transaction confirmation

5. **Verify Initialization**
   - Check that all components show as "Created" in the admin panel
   - Test staking functionality with a small amount

### Expected Timeline
- Each step takes 1-3 seconds for transaction confirmation
- Total initialization time: ~1-2 minutes
- Pool is ready for use immediately after completion

## Network Configuration

The application supports three networks:

### Localnet
- LABS Token: `2edbfZ4FdrkSrxYDsZEwVHP2QfFpbuXpgtfHgJA1G2pg`
- RPC: `http://127.0.0.1:8899`

### Devnet (Default)
- LABS Token: `5xMz2PeLhC3t2dm5FBDq5GRAaA46PPQvTPBKEdRyppct`
- RPC: `https://api.devnet.solana.com`

### Mainnet-Beta
- LABS Token: `LABSh5DTebUcUbEoLzXKCiXFJLecDFiDWiBGUU1GpxR`
- RPC: `https://api.mainnet-beta.solana.com`

Network can be changed via the `NEXT_PUBLIC_SOLANA_CLUSTER` environment variable.

## Getting Help

If you continue to experience issues:

1. Check browser console for error messages
2. Verify wallet connection and network
3. Ensure sufficient token/SOL balances
4. Contact technical support with:
   - Wallet address
   - Transaction signatures
   - Error messages
   - Steps to reproduce

## Development Notes

### For Developers
- All staking operations require initialization check first
- Error messages include specific missing components
- Admin functions are protected by wallet address verification
- Automatic token account creation is handled in transactions
