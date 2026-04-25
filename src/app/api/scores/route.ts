import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { onchainRecordSession } from '@/lib/onchain'

interface ScorePayload {
  wallet_address: string
  score: number
  taps: number
  max_combo: number
  session_duration?: number
}

// POST /api/scores — submit a completed game session score
export async function POST(req: NextRequest) {
  let body: ScorePayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { wallet_address, score, taps, max_combo, session_duration } = body

  if (!wallet_address || !/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
    return NextResponse.json({ error: 'Invalid wallet_address' }, { status: 400 })
  }
  if (typeof score !== 'number' || score < 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
  }

  const wallet = wallet_address.toLowerCase()

  // Resolve user
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, username')
    .eq('wallet_address', wallet)
    .maybeSingle()

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Insert score row
  const { data: scoreRow, error: scoreErr } = await supabase
    .from('scores')
    .insert({
      user_id: user.id,
      score,
      taps: taps ?? 0,
      max_combo: max_combo ?? 0,
      session_duration: session_duration ?? null,
    })
    .select()
    .single()

  if (scoreErr) return NextResponse.json({ error: scoreErr.message }, { status: 500 })

  // Update leaderboard aggregate (upsert)
  await supabase.rpc('increment_leaderboard', {
    p_user_id: user.id,
    p_score: score,
    p_taps: taps ?? 0,
  })

  // Onchain — fire-and-forget (explicit nonces to avoid collision on Monad RPC)
  if (process.env.OPERATOR_PRIVATE_KEY) {
    const uname = user.username ?? wallet
    onchainRecordSession(wallet, score, taps ?? 0, max_combo ?? 0, session_duration ?? 0, uname)
      .catch((err) => console.error('[onchain] score submission failed:', err))
  }

  return NextResponse.json(scoreRow, { status: 201 })
}
