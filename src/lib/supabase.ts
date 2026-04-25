import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
}

// Server-only client — uses service role key, never exposed to browser
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

// ── DB row types ──────────────────────────────────────────────────────────────

export interface DbUser {
  id: string
  username: string
  wallet_address: string
  created_at: string
  updated_at: string
}

export interface DbScore {
  id: string
  user_id: string
  score: number
  taps: number
  max_combo: number
  session_duration: number | null
  created_at: string
}

export interface DbMatch {
  id: string
  player_a_id: string
  player_b_id: string
  player_a_score: number
  player_b_score: number
  winner_id: string | null
  duration: number | null
  created_at: string
}

export interface DbLeaderboard {
  id: string
  user_id: string
  total_score: number
  total_taps: number
  wins: number
  losses: number
  updated_at: string
  users?: { username: string; wallet_address: string }
}
