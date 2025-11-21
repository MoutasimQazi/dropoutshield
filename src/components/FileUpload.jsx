import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import useDataStore from '../store/useDataStore'
import { predictDropout, isBackendOnline } from '../services/api'
import useAuthStore from '../store/useAuthStore'
import { saveTeacherToBackendOrLocal } from '../services/storage'
import { Upload, FileText, CheckCircle2, AlertCircle, XCircle, Cloud, HardDrive, Sparkles, Info } from 'lucide-react'

export default function FileUpload() {
  const setDataset = useDataStore((s) => s.setDataset)
  const setPredictions = useDataStore((s) => s.setPredictions)
  const user = useAuthStore((s) => s.user)
  const [backend, setBackend] = useState(false)
  const [warning, setWarning] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(()=>{ isBackendOnline().then(setBackend) }, [])

  const REQUIRED = [
    'attendance_pct','grades_avg','num_failed_subjects','family_income_bracket','parent_education_level','parent_occupation','distance_to_school','transport_available','extracurricular_participation','disciplinary_records','chronic_health_issues','nutrition_status','teacher_student_ratio','parent_meeting_attendance','intervention_history'
  ]

  function normalizeRow(r){
    // Map legacy columns to new schema if present
    return {
      id: r.id ?? r.ID ?? r.Id ?? '',
      name: r.name ?? r.Name ?? '',
      class: r.class ?? r.Class ?? r.Section ?? '',
      attendance_pct: r.attendance_pct ?? r.attendance ?? r.Attendance ?? '',
      grades_avg: r.grades_avg ?? r.avg_score ?? r.AverageScore ?? r.Score ?? '',
      num_failed_subjects: r.num_failed_subjects ?? r.failed_subjects ?? '',
      family_income_bracket: r.family_income_bracket ?? r.income_bracket ?? '',
      parent_education_level: r.parent_education_level ?? r.parent_edu ?? '',
      parent_occupation: r.parent_occupation ?? r.parent_job ?? '',
      distance_to_school: r.distance_to_school ?? r.distance ?? '',
      transport_available: r.transport_available ?? r.transport ?? '',
      extracurricular_participation: r.extracurricular_participation ?? r.extracurricular ?? '',
      disciplinary_records: r.disciplinary_records ?? r.disciplinary ?? '',
      chronic_health_issues: r.chronic_health_issues ?? r.health_issues ?? '',
      nutrition_status: r.nutrition_status ?? r.nutrition ?? '',
      teacher_student_ratio: r.teacher_student_ratio ?? r.ratio ?? '',
      parent_meeting_attendance: r.parent_meeting_attendance ?? r.meeting_attendance ?? '',
      intervention_history: r.intervention_history ?? r.behavior_flags ?? r.flags ?? '',
    }
  }

  const onFile = async (file) => {
    if (!file) return
    setWarning('')
    setSaveStatus('')
    setUploading(true)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        let rows = res.data.filter(r => Object.keys(r).length > 0)
        rows = rows.map(normalizeRow)
        // Check missing columns (excluding id/name/class which are optional for model)
        const present = new Set(Object.keys(rows[0] || {}))
        const missing = REQUIRED.filter(k => !present.has(k))
        if (missing.length) {
          setWarning('Missing columns: ' + missing.join(', '))
        }
        setDataset(rows)
        const preds = await predictDropout(rows)
        setPredictions(preds)
        // Immediately persist to backend if teacher
        if (user?.role === 'teacher' && user?.name) {
          try {
            const status = await saveTeacherToBackendOrLocal(user.name, rows)
            if (status.backend) setSaveStatus('saved-server')
            else if (status.savedLocal) setSaveStatus('saved-local')
            else setSaveStatus('save-failed')
          } catch (e) {
            console.warn('Persist after CSV upload failed', e)
            setSaveStatus('save-error')
          }
        }
        setUploading(false)
      },
      error: (err) => {
        console.error(err)
        setWarning('Failed to parse CSV. Please check format.')
        setUploading(false)
      }
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 overflow-hidden hover:border-blue-400 transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Upload Student Data</h3>
              <p className="text-blue-100 text-sm">Import CSV file for AI analysis</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            backend ? 'bg-green-500/20 text-green-100' : 'bg-amber-500/20 text-amber-100'
          }`}>
            {backend ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
            <span className="text-xs font-medium">{backend ? 'Server Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`p-8 transition-all duration-300 ${
          dragActive ? 'bg-blue-50 border-blue-400' : 'bg-gradient-to-br from-gray-50 to-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="inline-flex p-4 bg-blue-100 rounded-full animate-pulse">
                <Sparkles className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-700 font-medium">Processing your data...</p>
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="inline-flex p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4 transform hover:scale-110 transition-transform duration-300">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Drag & Drop or Click to Upload
              </h4>
              <p className="text-gray-600 mb-6">
                Supports CSV files with student data
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <Upload className="w-5 h-5" />
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => onFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">Required Columns</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {REQUIRED.slice(0, 5).join(', ')}, and {REQUIRED.length - 5} more fields
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(warning || saveStatus) && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-2">
          {warning && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Warning</p>
                <p className="text-xs text-amber-700 mt-1">{warning}</p>
              </div>
            </div>
          )}
          {saveStatus === 'saved-server' && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Successfully saved to server</p>
              </div>
            </div>
          )}
          {saveStatus === 'saved-local' && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <HardDrive className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Server offline - saved locally</p>
              </div>
            </div>
          )}
          {(saveStatus === 'save-failed' || saveStatus === 'save-error') && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Save failed</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
