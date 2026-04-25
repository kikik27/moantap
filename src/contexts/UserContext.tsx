'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import type { MoanTapUser } from '@/types/user'
import { findOrCreateUser } from '@/lib/userStore'

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
  const [user, setUser] = useState<MoanTapUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(() => {
    if (!isConnected || !address) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const u = findOrCreateUser(address)
    setUser(u)
    setIsLoading(false)
  }, [isConnected, address])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
