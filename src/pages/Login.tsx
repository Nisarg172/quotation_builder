import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Input from '@/components/ui/Input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  if (user && !loading) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }

    setLoading(false)
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-brand-primary/20">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <Input
                label="Email Address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                leftIcon={<MdEmail className="h-5 w-5 text-slate-400" />}
              />
            </div>

            {/* Password Field */}
            <div>
              <Input
                label="Password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<MdLock className="h-5 w-5 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    className="flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    ) : (
                      <MdVisibility className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password || !isValidEmail(email)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--brand-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

        
        </div>
      </div>
    </div>
  )
}