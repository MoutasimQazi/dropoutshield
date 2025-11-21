import RiskBadge from './RiskBadge'
import SuggestionsPanel from './SuggestionsPanel'
import { X, User, GraduationCap, TrendingUp, Calendar, Users as UsersIcon, MapPin, Bus, Trophy, AlertTriangle, Heart, Apple, School, UserCheck, FileText } from 'lucide-react'

export default function StudentModal({ student, onClose }) {
  if (!student) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{student.name}</h3>
                <div className="flex items-center gap-3 text-blue-100">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {student.class}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    ID: {student.id}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Risk Score */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Dropout Risk Score</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">{Math.round(student.probability * 100)}%</span>
                <RiskBadge level={student.riskLevel} size="lg" />
              </div>
              <div className="mt-2 h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${student.probability * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6 space-y-6">
          {/* Student Details Grid */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Student Profile
            </h4>
            <FeatureGrid features={student.features} />
          </div>

          {/* AI Suggestions */}
          <div>
            <SuggestionsPanel items={student.suggestions} showHeader={true} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureGrid({ features }) {
  if (!features) return null
  
  const featureItems = [
    { icon: Calendar, label: 'Attendance', value: show(features.attendance_pct, '%'), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: TrendingUp, label: 'Grades Average', value: show(features.grades_avg), color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: AlertTriangle, label: 'Failed Subjects', value: show(features.num_failed_subjects), color: 'text-red-600', bg: 'bg-red-50' },
    { icon: UsersIcon, label: 'Family Income', value: features.family_income_bracket || '—', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: GraduationCap, label: 'Parent Education', value: features.parent_education_level || '—', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: User, label: 'Parent Occupation', value: features.parent_occupation || '—', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: MapPin, label: 'Distance (km)', value: show(features.distance_to_school), color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: Bus, label: 'Transport', value: features.transport_available === 1 ? 'Available' : features.transport_available === 0 ? 'Not Available' : '—', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { icon: Trophy, label: 'Extracurricular', value: features.extracurricular_participation === 1 ? 'Active' : features.extracurricular_participation === 0 ? 'None' : '—', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: AlertTriangle, label: 'Disciplinary Records', value: show(features.disciplinary_records), color: 'text-red-600', bg: 'bg-red-50' },
    { icon: Heart, label: 'Chronic Health', value: features.chronic_health_issues === 1 ? 'Yes' : features.chronic_health_issues === 0 ? 'No' : '—', color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: Apple, label: 'Nutrition Status', value: features.nutrition_status || '—', color: 'text-lime-600', bg: 'bg-lime-50' },
    { icon: School, label: 'Teacher/Student Ratio', value: show(features.teacher_student_ratio), color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: UserCheck, label: 'Parent Meetings', value: show(features.parent_meeting_attendance), color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: FileText, label: 'Interventions', value: features.intervention_history || '—', color: 'text-slate-600', bg: 'bg-slate-50' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {featureItems.map(({ icon: Icon, label, value, color, bg }, i) => (
        <div key={i} className={`${bg} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </div>
          <div className="text-sm font-semibold text-gray-900 truncate">{value}</div>
        </div>
      ))}
    </div>
  )
}

function show(v, suffix = ''){ 
  return (v == null || isNaN(v)) ? '—' : `${v}${suffix}` 
}
