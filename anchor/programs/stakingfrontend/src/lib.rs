#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("7XWfye1o2g4aq6bQLKYbZcWJ5YkyJ58XpXSLLm9CM2ig");

#[program]
pub mod stakingfrontend {
    use super::*;

    pub fn close(_ctx: Context<CloseStakingfrontend>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.stakingfrontend.count = ctx.accounts.stakingfrontend.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.stakingfrontend.count = ctx.accounts.stakingfrontend.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeStakingfrontend>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.stakingfrontend.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeStakingfrontend<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Stakingfrontend::INIT_SPACE,
  payer = payer
    )]
    pub stakingfrontend: Account<'info, Stakingfrontend>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseStakingfrontend<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub stakingfrontend: Account<'info, Stakingfrontend>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub stakingfrontend: Account<'info, Stakingfrontend>,
}

#[account]
#[derive(InitSpace)]
pub struct Stakingfrontend {
    count: u8,
}
