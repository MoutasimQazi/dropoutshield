import { useEffect, useState } from 'react'
import useDataStore from '../store/useDataStore'
import useAuthStore from '../store/useAuthStore'
import RiskBadge from '../components/RiskBadge'
import SuggestionsPanel from '../components/SuggestionsPanel'
import { loadTeacherToStore } from '../services/storage'
import { 
  Users, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Target,
  Activity,
  Calendar,
  BookOpen,
  Sparkles
} from 'lucide-react'

export default function TeacherDashboard() {
  const predictions = useDataStore((s) => s.predictions)
  const students = useDataStore((s) => s.students)
  const setDataset = useDataStore((s) => s.setDataset)
  const setPredictions = useDataStore((s) => s.setPredictions)
  const user = useAuthStore((s) => s.user)
  const [loadStatus, setLoadStatus] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function autoLoad() {
      if (!user || user.role !== 'teacher') return
      // Only auto-load once when store is empty
      if (students.length > 0 || predictions.length > 0) return
      setLoadStatus('Loading data...')
      try {
        await loadTeacherToStore(user.name, setDataset, setPredictions)
        if (!cancelled) setLoadStatus('Loaded')
      } catch (e) {
        console.warn('Auto load failed', e)
        if (!cancelled) setLoadStatus('Load failed')
      }
    }
    autoLoad()
    return () => { cancelled = true }
  }, [user, students.length, predictions.length, setDataset, setPredictions])

  const topAtRisk = [...predictions].sort((a,b) => b.probability - a.probability).slice(0, 10)
  
  const highRiskCount = predictions.filter(p=>p.riskLevel==='High').length
  const mediumRiskCount = predictions.filter(p=>p.riskLevel==='Medium').length
  const lowRiskCount = predictions.filter(p=>p.riskLevel==='Low').length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoadStatus('Refreshing...')
    try {
      await loadTeacherToStore(user.name, setDataset, setPredictions)
      setLoadStatus('Data refreshed successfully')
    } catch (e) {
      setLoadStatus('Refresh failed')
    }
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Teacher Dashboard</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {user?.name && <span className="capitalize">{user.name}</span>}
              </p>
            </div>
          </div>
        </div>

        <p className="text-blue-100 mb-6 max-w-2xl">
          Monitor your students' risk levels and take proactive action with AI-powered insights
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          {loadStatus && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm">
              {loadStatus.includes('success') ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : loadStatus.includes('failed') ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4 animate-pulse" />
              )}
              {loadStatus}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {predictions.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="inline-flex p-4 bg-gray-200 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Student Data</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            {loadStatus.includes('Load') ? loadStatus : 'Upload a CSV file or add students to get started with predictions'}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {predictions.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Students" 
              value={predictions.length} 
              icon={<Users className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard 
              label="High Risk" 
              value={highRiskCount} 
              icon={<AlertTriangle className="w-6 h-6" />}
              gradient="from-red-500 to-rose-600"
              percentage={predictions.length ? Math.round((highRiskCount / predictions.length) * 100) : 0}
            />
            <StatCard 
              label="Medium Risk" 
              value={mediumRiskCount} 
              icon={<AlertCircle className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-500"
              percentage={predictions.length ? Math.round((mediumRiskCount / predictions.length) * 100) : 0}
            />
            <StatCard 
              label="Low Risk" 
              value={lowRiskCount} 
              icon={<CheckCircle2 className="w-6 h-6" />}
              gradient="from-emerald-500 to-green-600"
              percentage={predictions.length ? Math.round((lowRiskCount / predictions.length) * 100) : 0}
            />
          </div>

          {/* Top At-Risk Students */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-red-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Top At-Risk Students</h3>
                    <p className="text-sm text-gray-500">Students requiring immediate attention</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  {topAtRisk.length} students
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {topAtRisk.map((s, idx) => (
                <div key={s.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                        idx === 1 ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                        'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {idx + 1}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{s.name}</h4>
                            <RiskBadge level={s.riskLevel} size="sm" />
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {s.class}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Risk: {Math.round(s.probability*100)}%
                            </span>
                            {s.features?.attendance_pct && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Attendance: {s.features.attendance_pct}%
                              </span>
                            )}
                            {s.features?.grades_avg && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                Grade: {s.features.grades_avg}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Risk Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Dropout Risk Level</span>
                          <span className="font-bold">{Math.round(s.probability*100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              s.riskLevel === 'High' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                              s.riskLevel === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gradient-to-r from-emerald-500 to-green-600'
                            }`}
                            style={{ width: `${s.probability * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Suggestions */}
                      {s.suggestions && s.suggestions.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-semibold text-gray-900">Recommended Actions</span>
                          </div>
                          <SuggestionsPanel items={s.suggestions} variant="compact" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, gradient, percentage }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
        {percentage !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500">{percentage}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
