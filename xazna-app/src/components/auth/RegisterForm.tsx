import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface RegisterFormProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>
  onBackToLogin: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onBackToLogin,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name || !email || !password) {
      setError('Iltimos, barcha maydonlarni to\'ldiring')
      return
    }

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi')
      return
    }

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgi bo\'lishi kerak')
      return
    }

    setIsLoading(true)
    try {
      await onRegister(email, password, name)
    } catch (err) {
      setError('Ro\'yxatdan otishda xatolik yuz berdi')
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              To\'liq ism
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-white shadow-sm"
              placeholder="Ali Valiyev"
              disabled={isLoading}
            />
          </div>

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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Parolni tasdiqlash
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all bg-white shadow-sm"
              placeholder="Parolni takrorlang"
              disabled={isLoading}
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
            Ro\'yxatdan o\'tish
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Hisobingiz bormi?{' '}
            <button
              onClick={onBackToLogin}
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              disabled={isLoading}
            >
              Kirish
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
