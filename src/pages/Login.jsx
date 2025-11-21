import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useDataStore from '../store/useDataStore'
import { loadTeacherToStore } from '../services/storage'
import { Shield, User, Lock, LogIn, AlertCircle, Users, BarChart3, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const setRoleInData = useDataStore((s) => s.setRole)

  const allowedUsers = {
    teacher1: 'teacher',
    teacher2: 'teacher',
    teacher3: 'teacher',
    principal: 'principal',
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const u = String(username || '').trim().toLowerCase()
    if (!u || !password) {
      setError('Please enter both username and password')
      setIsLoading(false)
      return
    }
    if (!allowedUsers[u] || password !== 'password') {
      setError('Invalid credentials. Try teacher1/2/3 or principal with password "password".')
      setIsLoading(false)
      return
    }
    const role = allowedUsers[u]
    login({ name: u, email: '', role })
    setRoleInData(role)
    // Load previously saved dataset for this user (if any)
    loadTeacherToStore(u, useDataStore.getState().setDataset, useDataStore.getState().setPredictions)
    const redirectTo = role === 'teacher' ? '/teacher' : '/principal'
    const from = location.state?.from?.pathname
    navigate(from || redirectTo, { replace: true })
  }

  const quickLogin = (user) => {
    setUsername(user)
    setPassword('password')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Shield className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <LogIn className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Sign In</h2>
            </div>
          </div>

          {/* Form */}
          <form className="p-8 space-y-6" onSubmit={onSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                  value={username}
                  onChange={e=>setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Demo Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">Demo Mode:</span> Use the quick login buttons below or enter credentials manually
                </p>
              </div>
              
              {/* Quick Login Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 mb-2">Quick Login:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher1')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                  >
                    <Users className="w-4 h-4" />
                    Teacher 1
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher2')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                  >
                    <Users className="w-4 h-4" />
                    Teacher 2
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher3')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                  >
                    <Users className="w-4 h-4" />
                    Teacher 3
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('principal')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 border-2 border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Principal
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Password: <code className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">password</code>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
