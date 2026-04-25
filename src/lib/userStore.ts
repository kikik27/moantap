import type { MoanTapUser } from '@/types/user'
import { generateUsername } from './usernameGenerator'

const STORAGE_KEY = 'moantap_users'

function loadUsers(): Record<string, MoanTapUser> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsers(users: Record<string, MoanTapUser>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function findOrCreateUser(walletAddress: string): MoanTapUser {
  const users = loadUsers()
  const key = walletAddress.toLowerCase()

  if (users[key]) return users[key]

  const user: MoanTapUser = {
    id: crypto.randomUUID(),
    walletAddress: key,
    username: generateUsername(),
    bestScore: 0,
    totalTaps: 0,
  }

  users[key] = user
  saveUsers(users)
  return user
}

export function updateUserScore(walletAddress: string, score: number, taps: number) {
  const users = loadUsers()
  const key = walletAddress.toLowerCase()
  const user = users[key]
  if (!user) return

  if (score > user.bestScore) user.bestScore = score
  user.totalTaps += taps
  saveUsers(users)
}

export function getLeaderboard(limit = 20): MoanTapUser[] {
  const users = loadUsers()
  return Object.values(users)
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, limit)
}
