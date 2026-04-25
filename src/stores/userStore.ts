import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MoanTapUser } from '@/types/user'
import { generateUsername } from '@/lib/usernameGenerator'

interface UserState {
  users: Record<string, MoanTapUser>
  currentUserWallet: string | null

  // Actions
  findOrCreateUser: (walletAddress: string) => MoanTapUser
  getCurrentUser: () => MoanTapUser | null
  updateScore: (walletAddress: string, score: number) => void
  addTaps: (walletAddress: string, taps: number) => void
  setCurrentWallet: (wallet: string | null) => void
  getLeaderboard: (limit?: number) => MoanTapUser[]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: {},
      currentUserWallet: null,

      findOrCreateUser: (walletAddress: string) => {
        const key = walletAddress.toLowerCase()
        const existing = get().users[key]
        if (existing) return existing

        const user: MoanTapUser = {
          id: crypto.randomUUID(),
          walletAddress: key,
          username: generateUsername(),
          bestScore: 0,
          totalTaps: 0,
        }

        set((state) => ({
          users: { ...state.users, [key]: user },
        }))

        return user
      },

      getCurrentUser: () => {
        const { users, currentUserWallet } = get()
        if (!currentUserWallet) return null
        return users[currentUserWallet.toLowerCase()] ?? null
      },

      updateScore: (walletAddress: string, score: number) => {
        const key = walletAddress.toLowerCase()
        set((state) => {
          const user = state.users[key]
          if (!user) return state
          return {
            users: {
              ...state.users,
              [key]: {
                ...user,
                bestScore: Math.max(user.bestScore, score),
              },
            },
          }
        })
      },

      addTaps: (walletAddress: string, taps: number) => {
        const key = walletAddress.toLowerCase()
        set((state) => {
          const user = state.users[key]
          if (!user) return state
          return {
            users: {
              ...state.users,
              [key]: {
                ...user,
                totalTaps: user.totalTaps + taps,
              },
            },
          }
        })
      },

      setCurrentWallet: (wallet: string | null) => {
        set({ currentUserWallet: wallet })
      },

      getLeaderboard: (limit = 20) => {
        return Object.values(get().users)
          .sort((a, b) => b.bestScore - a.bestScore)
          .slice(0, limit)
      },
    }),
    {
      name: 'moantap_users',
    },
  ),
)
