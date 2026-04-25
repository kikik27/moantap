import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/leaderboard — top 20 players by total_score
export async function GET() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select(`
      total_score,
      total_taps,
      wins,
      losses,
      users ( username, wallet_address )
    `)
    .order('total_score', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((row, i) => {
    const u = Array.isArray(row.users) ? row.users[0] : row.users as { username: string; wallet_address: string } | null
    return {
      rank: i + 1,
      username: u?.username ?? 'Unknown',
      wallet_address: u?.wallet_address ?? '',
      total_score: row.total_score,
      total_taps: row.total_taps,
      wins: row.wins,
      losses: row.losses,
    }
  })

  return NextResponse.json(rows)
}
