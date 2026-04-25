import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { onchainRecordPvP } from '@/lib/onchain'

interface MatchPayload {
  player_a_wallet: string
  player_b_wallet: string
  player_a_score: number
  player_b_score: number
  duration?: number
}

// POST /api/matches — record a completed PvP match result
export async function POST(req: NextRequest) {
  let body: MatchPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { player_a_wallet, player_b_wallet, player_a_score, player_b_score, duration } = body

  if (
    !player_a_wallet || !/^0x[0-9a-fA-F]{40}$/.test(player_a_wallet) ||
    !player_b_wallet || !/^0x[0-9a-fA-F]{40}$/.test(player_b_wallet)
  ) {
    return NextResponse.json({ error: 'Invalid wallet addresses' }, { status: 400 })
  }

  // Resolve both users
  const [{ data: userA }, { data: userB }] = await Promise.all([
    supabase.from('users').select('id, username').eq('wallet_address', player_a_wallet.toLowerCase()).maybeSingle(),
    supabase.from('users').select('id, username').eq('wallet_address', player_b_wallet.toLowerCase()).maybeSingle(),
  ])

  if (!userA || !userB) {
    return NextResponse.json({ error: 'One or both players not found' }, { status: 404 })
  }

  const winner_id =
    player_a_score > player_b_score ? userA.id :
    player_b_score > player_a_score ? userB.id :
    null // draw

  const { data: match, error: matchErr } = await supabase
    .from('matches')
    .insert({
      player_a_id: userA.id,
      player_b_id: userB.id,
      player_a_score,
      player_b_score,
      winner_id,
      duration: duration ?? null,
    })
    .select()
    .single()

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 })

  // Update win/loss counts on leaderboard
  if (winner_id) {
    const loser_id = winner_id === userA.id ? userB.id : userA.id
    await Promise.all([
      supabase.rpc('increment_wins',   { p_user_id: winner_id }),
      supabase.rpc('increment_losses', { p_user_id: loser_id }),
    ])
  }

  // Onchain — fire-and-forget
  if (winner_id && process.env.OPERATOR_PRIVATE_KEY) {
    const winnerWallet   = winner_id === userA.id ? player_a_wallet : player_b_wallet
    const loserWallet    = winner_id === userA.id ? player_b_wallet : player_a_wallet
    const winnerUsername = winner_id === userA.id ? (userA.username ?? player_a_wallet) : (userB.username ?? player_b_wallet)
    const loserUsername  = winner_id === userA.id ? (userB.username ?? player_b_wallet) : (userA.username ?? player_a_wallet)
    onchainRecordPvP(winnerWallet, loserWallet, winnerUsername, loserUsername)
      .catch((err) => console.error('[onchain] pvp submission failed:', err))
  }

  return NextResponse.json(match, { status: 201 })
}
