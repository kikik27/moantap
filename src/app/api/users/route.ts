import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/users — upsert user by wallet address
export async function POST(req: NextRequest) {
  let body: { wallet_address?: string; username?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { wallet_address, username } = body

  if (!wallet_address || !/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
    return NextResponse.json({ error: 'Invalid wallet_address' }, { status: 400 })
  }

  const wallet = wallet_address.toLowerCase()

  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', wallet)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(existing)
  }

  // Generate username if not provided
  const finalUsername = username ?? generateUsername()

  const { data, error } = await supabase
    .from('users')
    .insert({ wallet_address: wallet, username: finalUsername })
    .select()
    .single()

  if (error) {
    // Handle duplicate username race condition
    if (error.code === '23505') {
      const retryUsername = generateUsername()
      const { data: retryData, error: retryError } = await supabase
        .from('users')
        .insert({ wallet_address: wallet, username: retryUsername })
        .select()
        .single()
      if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 })
      return NextResponse.json(retryData, { status: 201 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Initialise leaderboard row
  await supabase.from('leaderboard').upsert(
    { user_id: data.id, total_score: 0, total_taps: 0, wins: 0, losses: 0 },
    { onConflict: 'user_id' },
  )

  return NextResponse.json(data, { status: 201 })
}

// ── Username generator (mirrored from client-side) ───────────────────────────
const ANIMALS = ['Kucing','Berang','Ayam','Gajah','Kuda','Monyet','Kelinci','Panda','Sapi','Kambing','Ikan','Burung','Kura','Ular','Bebek','Siput','Kupu','Lumba','Badak','Komodo']
const WORDS   = ['Tidur','Terbang','Makan','Lompat','Malas','Lari','Gelut','Nyanyi','Joget','Ketawa','Pusing','Santai','Galau','Rebahan','Megik','Ngoding','Main','Tapa','Kalem','Gemes']

function generateUsername(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const word   = WORDS[Math.floor(Math.random() * WORDS.length)]
  const digits = Math.floor(Math.random() * 900) + 100
  return `${animal}${word}${digits}`
}
