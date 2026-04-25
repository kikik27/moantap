-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username         VARCHAR(50)  UNIQUE NOT NULL,
  wallet_address   VARCHAR(42)  UNIQUE NOT NULL,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Scores ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score            INT          NOT NULL CHECK (score >= 0),
  taps             INT          DEFAULT 0,
  max_combo        INT          DEFAULT 0,
  session_duration INT,         -- seconds
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── PvP Matches ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_a_id      UUID         REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player_b_id      UUID         REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player_a_score   INT          DEFAULT 0,
  player_b_score   INT          DEFAULT 0,
  winner_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  duration         INT,         -- seconds
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Leaderboard (cached aggregate) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_score      INT          DEFAULT 0,
  total_taps       INT          DEFAULT 0,
  wins             INT          DEFAULT 0,
  losses           INT          DEFAULT 0,
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scores_user_id     ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at  ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score  ON leaderboard(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_player_a   ON matches(player_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_player_b   ON matches(player_b_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- All reads/writes go through server-side service role — disable RLS
ALTER TABLE users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores      DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches     DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard DISABLE ROW LEVEL SECURITY;

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RPC helpers (called by API routes) ───────────────────────────────────────

-- Increment leaderboard total_score and total_taps (upsert-safe)
CREATE OR REPLACE FUNCTION increment_leaderboard(
  p_user_id UUID,
  p_score   INT,
  p_taps    INT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO leaderboard (user_id, total_score, total_taps, wins, losses)
    VALUES (p_user_id, p_score, p_taps, 0, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET total_score = leaderboard.total_score + EXCLUDED.total_score,
        total_taps  = leaderboard.total_taps  + EXCLUDED.total_taps,
        updated_at  = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION increment_wins(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE leaderboard SET wins = wins + 1, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_losses(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE leaderboard SET losses = losses + 1, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
