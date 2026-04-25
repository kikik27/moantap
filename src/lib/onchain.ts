/**
 * onchain.ts — Server-side viem walletClient for operator contract calls.
 * Only import from API routes (Node.js runtime). Never import in client components.
 */
import { createPublicClient, createWalletClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import MOANTAP_ABI from '@/constants/MOANTAP.json'
import SCORE_TRACKER_ABI from '@/constants/ScoreTracker.json'

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
})

const MOANTAP_ADDRESS = process.env.MOANTAP_ADDRESS as `0x${string}`
const SCORE_TRACKER_ADDRESS = process.env.SCORE_TRACKER_ADDRESS as `0x${string}`

function getClients() {
  const privateKey = process.env.OPERATOR_PRIVATE_KEY
  if (!privateKey) throw new Error('OPERATOR_PRIVATE_KEY not set')

  const account = privateKeyToAccount(privateKey as `0x${string}`)

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(),
  })

  return { walletClient, publicClient, account }
}

export async function onchainRecordTap(playerAddress: string, score: number, username: string, nonce?: number): Promise<string> {
  const { walletClient, account } = getClients()
  const hash = await walletClient.writeContract({
    account,
    address: MOANTAP_ADDRESS,
    abi: MOANTAP_ABI.abi,
    functionName: 'recordTap',
    args: [playerAddress as `0x${string}`, BigInt(Math.floor(score)), username],
    ...(nonce !== undefined ? { nonce } : {}),
  })
  return hash
}

export async function onchainRecordPvP(winnerAddress: string, loserAddress: string, winnerUsername: string, loserUsername: string): Promise<string> {
  const { walletClient, account } = getClients()
  const hash = await walletClient.writeContract({
    account,
    address: MOANTAP_ADDRESS,
    abi: MOANTAP_ABI.abi,
    functionName: 'recordPvPResult',
    args: [winnerAddress as `0x${string}`, loserAddress as `0x${string}`, winnerUsername, loserUsername],
  })
  return hash
}

export async function onchainSubmitScore(
  playerAddress: string,
  score: number,
  taps: number,
  maxCombo: number,
  duration: number,
  username: string,
  nonce?: number,
): Promise<string> {
  const { walletClient, publicClient, account } = getClients()

  // Use provided nonce, or fetch pending nonce
  const txNonce = nonce ?? await publicClient.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  })

  const hash = await walletClient.writeContract({
    account,
    address: SCORE_TRACKER_ADDRESS,
    abi: SCORE_TRACKER_ABI.abi,
    functionName: 'submitScore',
    args: [
      playerAddress as `0x${string}`,
      BigInt(Math.floor(score)),
      Math.floor(taps),
      Math.floor(maxCombo),
      Math.floor(duration),
      username,
    ],
    nonce: txNonce,
  })
  return hash
}

/**
 * Record a tap session — sends recordTap + submitScore with consecutive
 * nonces (N and N+1) so they never collide even on Monad's pending RPC.
 */
export async function onchainRecordSession(
  playerAddress: string,
  score: number,
  taps: number,
  maxCombo: number,
  duration: number,
  username: string,
): Promise<{ tapHash: string; scoreHash: string }> {
  const { publicClient, account } = getClients()
  const baseNonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  })
  const tapHash   = await onchainRecordTap(playerAddress, score, username, baseNonce)
  const scoreHash = await onchainSubmitScore(playerAddress, score, taps, maxCombo, duration, username, baseNonce + 1)
  return { tapHash, scoreHash }
}
