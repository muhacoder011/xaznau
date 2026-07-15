import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegisterClick?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegisterClick }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}

    if (!email.trim()) {
      newErrors.email = 'Email kiritish majburiy'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      newErrors.email = 'Noto\'g\'ri email formati'
    }

    if (!password) {
      newErrors.password = 'Parol kiritish majburiy'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      await onLogin(email.trim(), password)
    } catch (err) {
      setErrors({ email: 'Email yoki parol noto\'g\'ri' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm mx-auto mb-4">
            X
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xazina</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Xush kelibsiz!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email manzili <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
              className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`}
              placeholder="example@mail.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Parol <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
              className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`}
              placeholder="Parolingizni kiriting"
              disabled={isLoading}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5 list-disc list-inside">
                {Object.values(errors).map((err, i) => err && <li key={i}>{err}</li>)}
              </ul>
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hisobingiz yo\'qmi?{' '}
            <button
              onClick={() => onRegisterClick?.()}
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
