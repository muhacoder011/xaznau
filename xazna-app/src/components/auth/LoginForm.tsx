import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegisterClick?: () => void
  onGoogleLogin?: (email: string, name: string, avatar: string) => void
}

// Qurilmadagi mavjud Google akkauntlar ro'yxati (Simulyatsiya)
const GOOGLE_ACCOUNTS = [
  { email: 'nodirbek.dev@gmail.com', name: 'Nodirbek Alimov', avatar: 'N' },
  { email: 'xazina.user@gmail.com', name: 'Xazina Foydalanuvchisi', avatar: 'X' },
  { email: 'traveler.uz@gmail.com', name: 'Sayohat Ishqibozi', avatar: 'S' }
]

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegisterClick, onGoogleLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [showOtherAccountForm, setShowOtherAccountForm] = useState(false)
  const [otherEmail, setOtherEmail] = useState('')
  const [otherPassword, setOtherPassword] = useState('')
  const [otherErrors, setOtherErrors] = useState<{ email?: string; password?: string }>({})

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

  const handleGoogleAccountSelect = (account: typeof GOOGLE_ACCOUNTS[0]) => {
    setIsLoading(true)
    setTimeout(() => {
      // localStorage dagi ro'yxatdan o'tgan foydalanuvchilarni tekshirish
      const users = JSON.parse(localStorage.getItem('xazna_users') || '[]')
      const found = users.find((u: any) => u.email === account.email)
      
      if (found) {
        setIsLoading(false)
        setShowGoogleModal(false)
        if (onGoogleLogin) {
          onGoogleLogin(account.email, found.name || account.name, (found.name || account.name).charAt(0).toUpperCase())
        }
      } else {
        setIsLoading(false)
        // Email topilmadi — xatolik ko'rsatish
        setOtherErrors({ email: `"${account.email}" ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting.` })
      }
    }, 800)
  }

  const handleOtherGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof otherErrors = {}

    if (!otherEmail.trim()) {
      newErrors.email = 'Google email kiritish majburiy'
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(otherEmail.trim())) {
      newErrors.email = 'Faqat haqiqiy @gmail.com manzili qabul qilinadi'
    }

    if (!otherPassword) {
      newErrors.password = 'Parol kiritish majburiy'
    } else if (otherPassword.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
    }

    setOtherErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    setTimeout(() => {
      // localStorage dagi ro'yxatdan o'tgan foydalanuvchilarni tekshirish
      const users = JSON.parse(localStorage.getItem('xazna_users') || '[]')
      const found = users.find((u: any) => u.email === otherEmail.trim())
      
      if (found && found.password === otherPassword) {
        setIsLoading(false)
        setShowGoogleModal(false)
        if (onGoogleLogin) {
          const nameFromEmail = otherEmail.split('@')[0]
          const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
          onGoogleLogin(otherEmail.trim(), found.name || formattedName, (found.name || formattedName).charAt(0))
        }
      } else if (found && found.password !== otherPassword) {
        setIsLoading(false)
        setOtherErrors({ password: 'Google hisob paroli noto\'g\'ri' })
      } else {
        // Email topilmadi — ro'yxatdan o'tmagan
        setIsLoading(false)
        setOtherErrors({ email: 'Bu Google hisob ro\'yxatdan o\'tmagan. Avval ro\'yxatdan o\'ting.' })
      }
    }, 1500)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
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

        {/* Google bilan kirish tugmasi */}
        <div className="mt-5">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Yoki</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <button
            type="button"
            onClick={() => { setShowGoogleModal(true); setShowOtherAccountForm(false); }}
            className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.435 0-6.223-2.788-6.223-6.223s2.788-6.223 6.223-6.223c1.555 0 2.963.574 4.037 1.518l3.111-3.111C19.222 2.37 15.963 1 12.24 1 6.037 1 1 6.037 1 12.24s5.037 11.24 11.24 11.24c5.852 0 10.741-4.222 11.24-9.963h-11.24z"
              />
            </svg>
            Google orqali kirish
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hisobingiz yo'qmi?{' '}
            <button
              onClick={() => onRegisterClick?.()}
              className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              disabled={isLoading}
            >
              Ro'yxatdan o'ting
            </button>
          </p>
        </div>
      </div>

      {/* Google Accounts Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 text-center relative">
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              <div className="flex justify-center mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Google orqali davom etish</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Xazina ilovasiga kirish uchun hisobni tanlang</p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {!showOtherAccountForm ? (
                <>
                  <div className="space-y-2">
                    {GOOGLE_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        onClick={() => handleGoogleAccountSelect(account)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {account.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{account.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.email}</p>
                        </div>
                        <div className="text-gray-400">
                          <i className="fa-solid fa-chevron-right text-xs"></i>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowOtherAccountForm(true)}
                    className="w-full py-3 px-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-user-plus"></i> Boshqa akkaunt orqali kirish
                  </button>
                </>
              ) : (
                <form onSubmit={handleOtherGoogleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Google Email (Gmail) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={otherEmail}
                      onChange={(e) => { setOtherEmail(e.target.value); setOtherErrors(prev => ({ ...prev, email: undefined })) }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${otherErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
                      placeholder="example@gmail.com"
                      disabled={isLoading}
                    />
                    {otherErrors.email && <p className="text-xs text-red-500">{otherErrors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Google Parol <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={otherPassword}
                      onChange={(e) => { setOtherPassword(e.target.value); setOtherErrors(prev => ({ ...prev, password: undefined })) }}
                      className={`w-full px-4 py-2.5 rounded-xl border ${otherErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400'} focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
                      placeholder="Google hisob paroli"
                      disabled={isLoading}
                    />
                    {otherErrors.password && <p className="text-xs text-red-500">{otherErrors.password}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowOtherAccountForm(false)}
                      className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      disabled={isLoading}
                    >
                      Orqaga
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      className="flex-1 py-2.5"
                    >
                      Tasdiqlash
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                Davom etish orqali siz Google xizmat ko'rsatish shartlari va Xazina maxfiylik siyosatiga rozilik bildirasiz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
