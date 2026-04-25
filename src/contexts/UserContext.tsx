'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import type { MoanTapUser } from '@/types/user'
import { useUserStore } from '@/stores/userStore'

interface UserContextValue {
  user: MoanTapUser | null
  isLoading: boolean
  refreshUser: () => void
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  refreshUser: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const findOrCreateUser = useUserStore((s) => s.findOrCreateUser)
  const setCurrentWallet = useUserStore((s) => s.setCurrentWallet)
  const getCurrentUser = useUserStore((s) => s.getCurrentUser)
  const [user, setUser] = useState<MoanTapUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)

  const loadUser = useCallback(async () => {
    if (!isConnected || !address) {
      setUser(null)
      setCurrentWallet(null)
      setIsLoading(false)
      return
    }

    // Don't flash the gate on re-loads (e.g. navigating between pages)
    if (!hasLoadedRef.current) setIsLoading(true)

    // Sync to Supabase (fire-and-forget — localStorage stays as fallback)
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      })
    } catch {
      // Non-fatal — app still works with localStorage
    }

    const u = findOrCreateUser(address)
    setCurrentWallet(address.toLowerCase())
    setUser(u)
    hasLoadedRef.current = true
    setIsLoading(false)
  }, [isConnected, address, findOrCreateUser, setCurrentWallet])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Subscribe to user changes in the store
  useEffect(() => {
    const unsub = useUserStore.subscribe((state) => {
      if (state.currentUserWallet) {
        const fresh = state.users[state.currentUserWallet.toLowerCase()]
        setUser(fresh ?? null)
      }
    })
    return unsub
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
