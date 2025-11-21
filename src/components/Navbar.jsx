import { Link, NavLink, useNavigate } from 'react-router-dom'
import useDataStore from '../store/useDataStore'
import useAuthStore from '../store/useAuthStore'
import { Shield, Upload, BarChart3, Users, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const role = useDataStore((s) => s.role)
  const setRole = useDataStore((s) => s.setRole)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                DropoutShield
              </span>
              <div className="text-xs text-gray-500 font-medium">AI-Powered Retention</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {user && (
              <NavLink 
                to="/upload" 
                className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </NavLink>
            )}
            {user?.role === 'teacher' && (
              <NavLink 
                to="/teacher" 
                className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
            {user?.role === 'principal' && (
              <NavLink 
                to="/principal" 
                className={({isActive}) => `flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl border border-blue-100 shadow-md">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize font-medium">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2 animate-in slide-in-from-top">
            {user && (
              <>
                {/* Mobile User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl border border-blue-100 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize font-medium">{user.role}</div>
                  </div>
                </div>
                
                <NavLink 
                  to="/upload" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload Data
                </NavLink>
              </>
            )}
            {user?.role === 'teacher' && (
              <NavLink 
                to="/teacher" 
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Teacher Dashboard
              </NavLink>
            )}
            {user?.role === 'principal' && (
              <NavLink 
                to="/principal" 
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Principal Dashboard
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
