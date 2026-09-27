import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import type { AppUser } from './types'

// デモ用の簡易ログイン：users テーブルのメールアドレスと一致すればログイン扱い
const STORAGE_KEY = 'casemanagement-demo-user-id'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      setLoading(false)
      return
    }
    supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUser(data as AppUser)
        else localStorage.removeItem(STORAGE_KEY)
        setLoading(false)
      })
  }, [])

  const login = useCallback(async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()
    if (error) throw new Error(`ログインに失敗しました: ${error.message}`)
    if (!data) throw new Error('このメールアドレスのユーザーは登録されていません')
    localStorage.setItem(STORAGE_KEY, data.id)
    setUser(data as AppUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
