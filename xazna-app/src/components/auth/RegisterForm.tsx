import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface RegisterFormProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>
  onBackToLogin: () => void
}

// Email formatini tekshirish
function isValidEmail(email: string): boolean {
  // Asosiy email regex: name@domain.xyz
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// Parol kuchliligini tekshirish
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Zaif', color: 'bg-red-500' }
  if (score <= 4) return { score, label: "O'rtacha", color: 'bg-amber-500' }
  return { score, label: 'Kuchli', color: 'bg-emerald-500' }
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  onBackToLogin,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    // Ism tekshirish
    if (!name.trim()) {
      newErrors.name = 'Ism kiritish majburiy'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Ism kamida 2 ta belgi bo\'lishi kerak'
    }

    // Email tekshirish
    if (!email.trim()) {
      newErrors.email = 'Email kiritish majburiy'
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Noto\'g\'ri email formati. Masalan: example@mail.com'
    }

    // Parol tekshirish
    if (!password) {
      newErrors.password = 'Parol kiritish majburiy'
    } else if (password.length < 8) {
      newErrors.password = 'Parol kamida 8 ta belgi bo\'lishi kerak'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Parolda kamida 1 ta katta harf bo\'lishi kerak'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Parolda kamida 1 ta kichik harf bo\'lishi kerak'
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Parolda kamida 1 ta raqam bo\'lishi kerak'
    }

    // Parolni tasdiqlash
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Parolni tasdiqlang'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmadi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await onRegister(email.trim(), password, name.trim())
    } catch (err) {
      setErrors({ email: 'Ro\'yxatdan otishda xatolik yuz berdi' })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = password ? getPasswordStrength(password) : null

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm mx-auto mb-4">
            X
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xazina</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hisob yaratish</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ism */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              To'liq ism <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })) }}
              className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`}
              placeholder="Ali Valiyev"
              disabled={isLoading}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
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

          {/* Parol */}
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
              placeholder="Kamida 8 ta belgi"
              disabled={isLoading}
            />
            {/* Parol kuchlilik indikatori */}
            {password && passwordStrength && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                  <li className={password.length >= 8 ? 'text-emerald-500' : ''}>
                    {password.length >= 8 ? '<i className="fa-solid fa-check"></i>' : '<i className="fa-solid fa-xmark"></i>'} Kamida 8 ta belgi
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-emerald-500' : ''}>
                    {/[A-Z]/.test(password) ? '<i className="fa-solid fa-check"></i>' : '<i className="fa-solid fa-xmark"></i>'} Katta harf (A-Z)
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-emerald-500' : ''}>
                    {/[a-z]/.test(password) ? '<i className="fa-solid fa-check"></i>' : '<i className="fa-solid fa-xmark"></i>'} Kichik harf (a-z)
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-emerald-500' : ''}>
                    {/[0-9]/.test(password) ? '<i className="fa-solid fa-check"></i>' : '<i className="fa-solid fa-xmark"></i>'} Raqam (0-9)
                  </li>
                </ul>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Parolni tasdiqlash */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Parolni tasdiqlash <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })) }}
              className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`}
              placeholder="Parolni takrorlang"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Umumiy xatolik */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Iltimos, quyidagi xatolarni to'g'rilang:
              </p>
              <ul className="text-xs text-red-500 dark:text-red-300 mt-1 space-y-0.5 list-disc list-inside">
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
            Ro'yxatdan o'tish
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hisobingiz bormi?{' '}
            <button
              onClick={onBackToLogin}
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
