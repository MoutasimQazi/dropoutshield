import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

export default function RiskBadge({ level, showIcon = true, size = 'md' }) {
  const configs = {
    High: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      text: 'text-white',
      border: 'border-red-200',
      icon: AlertTriangle,
      glow: 'shadow-red-500/50'
    },
    Medium: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      text: 'text-white',
      border: 'border-amber-200',
      icon: AlertCircle,
      glow: 'shadow-amber-500/50'
    },
    Low: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
      text: 'text-white',
      border: 'border-emerald-200',
      icon: CheckCircle,
      glow: 'shadow-emerald-500/50'
    }
  }

  const config = configs[level] || configs.Low
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} ${config.bg} ${config.text} rounded-full font-semibold shadow-lg ${config.glow} transform hover:scale-105 transition-transform duration-200`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{level} Risk</span>
    </span>
  )
}
