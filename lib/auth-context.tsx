'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  adminEmail: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = '123456'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = () => {
    const session = localStorage.getItem('adminSession')
    if (session) {
      try {
        const admin = JSON.parse(session)
        setAdminEmail(admin.email)
        setIsAuthenticated(true)
      } catch (err) {
        setIsAuthenticated(false)
        setAdminEmail(null)
      }
    } else {
      setIsAuthenticated(false)
      setAdminEmail(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const sessionData = {
        email: ADMIN_EMAIL,
        loginTime: new Date().toISOString(),
      }

      // Store session in localStorage
      localStorage.setItem('adminSession', JSON.stringify(sessionData))

      // Set cookie with proper attributes (path=/, SameSite=Lax, 7 days expiry)
      const expiryDate = new Date()
      expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      document.cookie = `admin_token=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`

      setAdminEmail(ADMIN_EMAIL)
      setIsAuthenticated(true)
    } else {
      throw new Error('Email hoặc mật khẩu không đúng')
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminSession')

    // Clear cookies
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'
    document.cookie = 'adminSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'

    setIsAuthenticated(false)
    setAdminEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminEmail, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
