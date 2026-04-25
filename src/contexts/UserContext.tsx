'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
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

  const loadUser = useCallback(() => {
    if (!isConnected || !address) {
      setUser(null)
      setCurrentWallet(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const wallet = address.toLowerCase()
    setCurrentWallet(wallet)
    const u = findOrCreateUser(wallet)
    setUser(u)
    setIsLoading(false)
  }, [isConnected, address, findOrCreateUser, setCurrentWallet])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Subscribe to user changes in the store
  useEffect(() => {
    const unsub = useUserStore.subscribe((state) => {
      if (state.currentUserWallet) {
        const fresh = state.users[state.currentUserWallet]
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
