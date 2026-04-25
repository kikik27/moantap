import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/users/:wallet — get user profile by wallet address
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> },
) {
  const { wallet } = await params
  const address = wallet.toLowerCase()

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', address)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Join leaderboard stats
  const { data: stats } = await supabase
    .from('leaderboard')
    .select('total_score, total_taps, wins, losses')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ ...user, stats: stats ?? null })
}
