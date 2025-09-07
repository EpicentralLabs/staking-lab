import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchStakingfrontend,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('stakingfrontend', () => {
  let payer: KeyPairSigner
  let stakingfrontend: KeyPairSigner

  beforeAll(async () => {
    stakingfrontend = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Stakingfrontend', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, stakingfrontend: stakingfrontend })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentStakingfrontend = await fetchStakingfrontend(rpc, stakingfrontend.address)
    expect(currentStakingfrontend.data.count).toEqual(0)
  })

  it('Increment Stakingfrontend', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      stakingfrontend: stakingfrontend.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchStakingfrontend(rpc, stakingfrontend.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Stakingfrontend Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ stakingfrontend: stakingfrontend.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchStakingfrontend(rpc, stakingfrontend.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Stakingfrontend', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      stakingfrontend: stakingfrontend.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchStakingfrontend(rpc, stakingfrontend.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set stakingfrontend value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ stakingfrontend: stakingfrontend.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchStakingfrontend(rpc, stakingfrontend.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the stakingfrontend account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      stakingfrontend: stakingfrontend.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchStakingfrontend(rpc, stakingfrontend.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${stakingfrontend.address}`)
    }
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
