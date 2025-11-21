import { useEffect, useState } from 'react'
import useDataStore from '../store/useDataStore'
import useAuthStore from '../store/useAuthStore'
import RiskBadge from '../components/RiskBadge'
import { fetchPrincipalData, isBackendOnline } from '../services/api'
import { loadTeacherStudents, loadDbCsvTeachers } from '../services/storage'
import { 
  BarChart3, 
  Users, 
  TrendingDown, 
  TrendingUp,
  RefreshCw, 
  AlertTriangle,
  GraduationCap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cloud,
  HardDrive
} from 'lucide-react'

export default function PrincipalDashboard() {
  const predictions = useDataStore((s) => s.predictions)
  const setDataset = useDataStore((s) => s.setDataset)
  const setPredictions = useDataStore((s) => s.setPredictions)
  const user = useAuthStore((s) => s.user)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dataSource, setDataSource] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (user?.role !== 'principal') return
      if (await isBackendOnline()) {
        try {
          const resp = await fetchPrincipalData()
          if (!cancelled && resp) {
            setDataset(resp.students)
            setPredictions(resp.predictions)
            setDataSource('server')
          }
          return
        } catch (e) {
          console.warn('Principal backend fetch failed', e)
        }
      }
      // Fallback: try reading CSVs from /db/*.csv (project files), then localStorage datasets
      const teacherIds = ['teacher1','teacher2','teacher3']
      let aggregate = []
      try {
        const csvRows = await loadDbCsvTeachers(teacherIds)
        if (csvRows && csvRows.length) {
          aggregate = csvRows
          setDataSource('csv')
        }
      } catch (e) {
        console.warn('CSV aggregate load failed', e)
      }
      if (!aggregate.length) {
        aggregate = teacherIds.flatMap(t => loadTeacherStudents(t).map(r => ({ ...r, teacher_id: t })))
        setDataSource('local')
      }
      const preds = await fetchPrincipalDataFallbackPredict(aggregate)
      if (!cancelled) {
        setDataset(aggregate)
        setPredictions(preds)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user, setDataset, setPredictions])

  const counts = predictions.reduce((acc, p) => {
    acc.total++
    acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1
    const key = p.class || 'N/A'
    acc.byClass[key] = acc.byClass[key] || { total: 0, high: 0, medium: 0, low: 0 }
    acc.byClass[key].total++
    if (p.riskLevel === 'High') acc.byClass[key].high++
    else if (p.riskLevel === 'Medium') acc.byClass[key].medium++
    else acc.byClass[key].low++
    return acc
  }, { total: 0, High: 0, Medium: 0, Low: 0, byClass: {} })

  const classes = Object.entries(counts.byClass).sort((a,b) => b[1].high - a[1].high)

  const handleRefreshServer = async () => {
    setIsRefreshing(true)
    const resp = await fetchPrincipalData().catch(()=>null)
    if (resp){ 
      setDataset(resp.students)
      setPredictions(resp.predictions)
      setDataSource('server')
    }
    setIsRefreshing(false)
  }

  const handleRefreshLocal = async () => {
    setIsRefreshing(true)
    const teacherIds = ['teacher1','teacher2','teacher3']
    let aggregate = []
    try {
      const csvRows = await loadDbCsvTeachers(teacherIds)
      if (csvRows && csvRows.length) {
        aggregate = csvRows
        setDataSource('csv')
      }
    } catch (e) { 
      console.warn('CSV refresh failed', e) 
    }
    if (!aggregate.length) {
      aggregate = teacherIds.flatMap(t => loadTeacherStudents(t).map(r => ({ ...r, teacher_id: t })))
      setDataSource('local')
    }
    const p = await fetchPrincipalDataFallbackPredict(aggregate)
    setDataset(aggregate)
    setPredictions(p)
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Principal Dashboard</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {user?.name && <span className="capitalize">{user.name}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              dataSource === 'server' ? 'bg-green-500/20 text-green-100' : 
              dataSource === 'csv' ? 'bg-blue-500/20 text-blue-100' :
              'bg-amber-500/20 text-amber-100'
            }`}>
              {dataSource === 'server' ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {dataSource === 'server' ? 'Server' : dataSource === 'csv' ? 'CSV Data' : 'Local Cache'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-blue-100 mb-6 max-w-2xl">
          Comprehensive overview of student risk levels across all classes and cohorts
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefreshServer}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Server
          </button>
          <button 
            onClick={handleRefreshLocal}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            <HardDrive className="w-4 h-4" />
            Refresh Local
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={counts.total} 
          icon={<Users className="w-6 h-6" />}
          gradient="from-blue-500 to-cyan-500"
          trend="+12%"
          trendUp={true}
        />
        <StatCard 
          label="High Risk" 
          value={counts.High} 
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-red-500 to-rose-600"
          percentage={counts.total ? Math.round((counts.High / counts.total) * 100) : 0}
        />
        <StatCard 
          label="Medium Risk" 
          value={counts.Medium} 
          icon={<AlertCircle className="w-6 h-6" />}
          gradient="from-amber-500 to-orange-500"
          percentage={counts.total ? Math.round((counts.Medium / counts.total) * 100) : 0}
        />
        <StatCard 
          label="Low Risk" 
          value={counts.Low} 
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-emerald-500 to-green-600"
          percentage={counts.total ? Math.round((counts.Low / counts.total) * 100) : 0}
        />
      </div>

      {/* Risk Distribution Chart */}
      {counts.total > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Risk Distribution</h3>
                <p className="text-sm text-gray-500">Overall student risk levels</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <RiskBar 
              label="High Risk" 
              value={counts.High} 
              total={counts.total} 
              color="from-red-500 to-rose-600"
            />
            <RiskBar 
              label="Medium Risk" 
              value={counts.Medium} 
              total={counts.total} 
              color="from-amber-500 to-orange-500"
            />
            <RiskBar 
              label="Low Risk" 
              value={counts.Low} 
              total={counts.total} 
              color="from-emerald-500 to-green-600"
            />
          </div>
        </div>
      )}

      {/* Classes Table */}
      {classes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Classes Overview</h3>
                <p className="text-sm text-gray-500">Ranked by high risk count</p>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    High Risk
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Medium Risk
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Low Risk
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Risk Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map(([cls, m], idx) => (
                  <tr 
                    key={cls} 
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {idx + 1}
                        </div>
                        <div className="font-semibold text-gray-900">{cls}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{m.total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                        <AlertTriangle className="w-3 h-3" />
                        {m.high}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold text-sm">
                        <AlertCircle className="w-3 h-3" />
                        {m.medium}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        {m.low}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-rose-600" 
                              style={{ width: `${(m.high / m.total) * 100}%` }}
                            />
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-orange-500" 
                              style={{ width: `${(m.medium / m.total) * 100}%` }}
                            />
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-green-600" 
                              style={{ width: `${(m.low / m.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {classes.map(([cls, m], idx) => (
              <div key={cls} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{cls}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {m.total} students
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg font-semibold text-xs text-center">
                    High: {m.high}
                  </span>
                  <span className="flex-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-semibold text-xs text-center">
                    Med: {m.medium}
                  </span>
                  <span className="flex-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-xs text-center">
                    Low: {m.low}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-600" 
                      style={{ width: `${(m.high / m.total) * 100}%` }}
                    />
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500" 
                      style={{ width: `${(m.medium / m.total) * 100}%` }}
                    />
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600" 
                      style={{ width: `${(m.low / m.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {predictions.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
          <div className="inline-flex p-4 bg-gray-200 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            No aggregated data yet. Teachers must upload their student datasets to begin analysis.
          </p>
        </div>
      )}
    </div>
  )
}

async function fetchPrincipalDataFallbackPredict(rows){
  // Lightweight client-side probability mirror
  return rows.map((r, idx) => {
    const f = {
      attendance_pct: num(r.attendance_pct),
      grades_avg: num(r.grades_avg),
      num_failed_subjects: num(r.num_failed_subjects),
      family_income_bracket: str(r.family_income_bracket),
      parent_education_level: str(r.parent_education_level),
      parent_occupation: str(r.parent_occupation),
      distance_to_school: num(r.distance_to_school),
      transport_available: num(r.transport_available),
      extracurricular_participation: num(r.extracurricular_participation),
      disciplinary_records: num(r.disciplinary_records),
      chronic_health_issues: num(r.chronic_health_issues),
      nutrition_status: str(r.nutrition_status),
      teacher_student_ratio: num(r.teacher_student_ratio),
      parent_meeting_attendance: num(r.parent_meeting_attendance),
      intervention_history: str(r.intervention_history)
    }
    let score = 0
    if (isFinite(f.attendance_pct)) score += (100 - f.attendance_pct) * 0.01
    if (isFinite(f.grades_avg)) score += Math.max(0, (60 - f.grades_avg) / 60) * 0.8
    if (isFinite(f.num_failed_subjects)) score += Math.min(3, f.num_failed_subjects) * 0.12
    if (isFinite(f.disciplinary_records)) score += Math.min(5, f.disciplinary_records) * 0.08
    if (f.chronic_health_issues === 1) score += 0.15
    if (/(low|lower)/i.test(f.family_income_bracket)) score += 0.18
    else if (/middle/i.test(f.family_income_bracket)) score += 0.08
    if (/(none|primary)/i.test(f.parent_education_level)) score += 0.12
    if (isFinite(f.distance_to_school)) score += Math.min(f.distance_to_school/20, 1) * 0.1
    if (f.transport_available === 0 && f.distance_to_school > 5) score += 0.07
    if (f.extracurricular_participation === 1) score -= 0.08
    if (/(under|mal)/i.test(f.nutrition_status)) score += 0.1
    if (isFinite(f.parent_meeting_attendance)) score += Math.max(0, (3 - f.parent_meeting_attendance)) * 0.06
    if (isFinite(f.teacher_student_ratio)) score += Math.max(0, (f.teacher_student_ratio - 30) / 30) * 0.12
    if (/tutoring|counsel|mentor/i.test(f.intervention_history)) score -= 0.05
    score = Math.max(-0.2, Math.min(2.5, score))
    const probability = 1/(1+Math.exp(-2*(score-0.9)))
    const riskLevel = probability > 0.7 ? 'High' : probability > 0.4 ? 'Medium' : 'Low'
    const suggestions = []
    return {
      id: r.id ?? idx + 1,
      name: r.name ?? `Student ${idx + 1}`,
      class: r.class ?? 'N/A',
      probability: Math.round(probability*100)/100,
      riskLevel,
      suggestions,
      features: f,
      teacher_id: r.teacher_id
    }
  })
}

function num(v){ const n = Number(v); return isNaN(n)?NaN:n }
function str(v){ return (v==null?'':String(v)).trim() }

function StatCard({ label, value, icon, gradient, trend, trendUp, percentage }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
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

function RiskBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-600">{value} students</span>
          <span className="font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 shadow-md`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
