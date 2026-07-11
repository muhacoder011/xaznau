import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegisterClick?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring')
      return
    }

    setIsLoading(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      setError('Login yoki parol noto\'g\'ri')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm mx-auto mb-4">
            X
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Xazina</h1>
          <p className="text-sm text-gray-500 mt-1">Sayohatlaringiz uchun birinchiloxlami</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email manzili
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-white shadow-sm"
              placeholder="example@mail.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Parol
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-white shadow-sm"
              placeholder="Kamida 6 ta belgi"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Kirish
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hisobingiz yo\'qmi?{' '}
            <button
              onClick={() => onRegisterClick?.()}
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              disabled={isLoading}
            >
              Ro\'yxatdan o\'ting
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
