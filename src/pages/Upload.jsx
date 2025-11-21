import { useMemo, useState } from 'react'
import FileUpload from '../components/FileUpload'
import useDataStore from '../store/useDataStore'
import DataTable from '../components/DataTable'
import { exportPredictionsCSV, exportStudentsCSV } from '../services/export'
import useAuthStore from '../store/useAuthStore'
import { saveTeacherStudents, loadTeacherStudents, saveTeacherToBackendOrLocal, loadTeacherToStore } from '../services/storage'
import { isBackendOnline } from '../services/api'
import { predictDropout } from '../services/api'
import { 
  Upload as UploadIcon, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Save,
  X,
  Plus,
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from 'lucide-react'

export default function Upload() {
  const students = useDataStore((s) => s.students)
  const predictions = useDataStore((s) => s.predictions)
  const setDataset = useDataStore((s) => s.setDataset)
  const setPredictions = useDataStore((s) => s.setPredictions)
  const user = useAuthStore((s) => s.user)

  const [risk, setRisk] = useState('all')
  const [q, setQ] = useState('')

  // Manual entry form state (extended model fields)
  const [mId, setMId] = useState('')
  const [mName, setMName] = useState('')
  const [mClass, setMClass] = useState('')
  const [mAttendance, setMAttendance] = useState('')
  const [mScore, setMScore] = useState('')
  const [mFailed, setMFailed] = useState('')
  const [mIncome, setMIncome] = useState('')
  const [mParentEdu, setMParentEdu] = useState('')
  const [mParentJob, setMParentJob] = useState('')
  const [mDistance, setMDistance] = useState('')
  const [mTransport, setMTransport] = useState('')
  const [mExtra, setMExtra] = useState('')
  const [mDisciplinary, setMDisciplinary] = useState('')
  const [mHealth, setMHealth] = useState('')
  const [mNutrition, setMNutrition] = useState('')
  const [mRatio, setMRatio] = useState('')
  const [mParentMeet, setMParentMeet] = useState('')
  const [mInterventions, setMInterventions] = useState('')
  const [mErr, setMErr] = useState('')
  const [showManualForm, setShowManualForm] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const filtered = useMemo(() => {
    let data = predictions
    if (risk !== 'all') data = data.filter(p => p.riskLevel === risk)
    if (q.trim()) {
      const t = q.toLowerCase()
      data = data.filter(p =>
        String(p.name).toLowerCase().includes(t) ||
        String(p.class).toLowerCase().includes(t) ||
        String(p.id).toLowerCase().includes(t)
      )
    }
    return data
  }, [predictions, risk, q])

  async function addManualStudent(e) {
    e.preventDefault()
    setMErr('')
    setSaveStatus('')
    if (!mName.trim()) { setMErr('Name is required'); return }
    // Prepare row consistent with CSV keys used by the predictor
    const nextId = mId.trim() || String(students.length ? (Number(students[students.length-1]?.id || students.length) + 1) : 1)
    const row = {
      id: nextId,
      name: mName.trim(),
      class: mClass.trim() || 'N/A',
      attendance_pct: mAttendance.trim(),
      grades_avg: mScore.trim(),
      num_failed_subjects: mFailed.trim(),
      family_income_bracket: mIncome.trim(),
      parent_education_level: mParentEdu.trim(),
      parent_occupation: mParentJob.trim(),
      distance_to_school: mDistance.trim(),
      transport_available: mTransport.trim(),
      extracurricular_participation: mExtra.trim(),
      disciplinary_records: mDisciplinary.trim(),
      chronic_health_issues: mHealth.trim(),
      nutrition_status: mNutrition.trim(),
      teacher_student_ratio: mRatio.trim(),
      parent_meeting_attendance: mParentMeet.trim(),
      intervention_history: mInterventions.trim(),
    }
    const newStudents = [...students, row]
    setDataset(newStudents)
    const preds = await predictDropout(newStudents)
    setPredictions(preds)
    // Persist immediately (best-effort) for teachers
    if (user?.role === 'teacher') {
      const status = await saveTeacherToBackendOrLocal(user.name, newStudents)
      setSaveStatus(status.backend ? 'Saved to server' : 'Saved locally')
      if (!status.backend) {
        console.warn('[Upload] Saved locally (backend unavailable).')
      }
    }
    // Reset form, keep class/flags sticky for faster entry
    setMId(''); setMName(''); setMClass(''); setMAttendance(''); setMScore(''); setMFailed(''); setMIncome(''); setMParentEdu(''); setMParentJob(''); setMDistance(''); setMTransport(''); setMExtra(''); setMDisciplinary(''); setMHealth(''); setMNutrition(''); setMRatio(''); setMParentMeet(''); setMInterventions('')
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <UploadIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Student Data Upload</h1>
              <p className="text-blue-100">Upload CSV files or add students manually</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <UploadIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload CSV File</h3>
              <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <FileUpload />
        </div>
      </div>

      {/* Manual Entry Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div 
          className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-5 border-b border-gray-100 cursor-pointer hover:from-gray-100 hover:to-purple-100 transition-all duration-200"
          onClick={() => setShowManualForm(!showManualForm)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Student Manually</h3>
                <p className="text-sm text-gray-500">Enter student details with extended attributes</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${showManualForm ? 'rotate-45' : ''}`}>
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        {showManualForm && (
          <div className="p-8 bg-gradient-to-br from-white to-purple-50/20">
            <form className="space-y-6" onSubmit={addManualStudent}>
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Field label="ID (optional)" value={mId} set={setMId} placeholder="auto" />
                  <Field label="Name" value={mName} set={setMName} placeholder="Student name" required span={2} />
                  <Field label="Class" value={mClass} set={setMClass} placeholder="10-A" />
                  <Field label="Attendance %" value={mAttendance} set={setMAttendance} type="number" placeholder="0-100" />
                  <Field label="Grades Avg" value={mScore} set={setMScore} type="number" placeholder="0-100" />
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Academic Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Field label="Failed Subjects" value={mFailed} set={setMFailed} type="number" placeholder="0" />
                  <Field label="Extracurricular" value={mExtra} set={setMExtra} type="number" placeholder="1/0" />
                  <Field label="Disciplinary Records" value={mDisciplinary} set={setMDisciplinary} type="number" placeholder="0" />
                  <Field label="Teacher/Student Ratio" value={mRatio} set={setMRatio} type="number" placeholder="30" span={2} />
                  <Field label="Intervention History" value={mInterventions} set={setMInterventions} placeholder="counseling" />
                </div>
              </div>

              {/* Family & Background */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Family & Background
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Field label="Income Bracket" value={mIncome} set={setMIncome} placeholder="low/middle/high" span={2} />
                  <Field label="Parent Education" value={mParentEdu} set={setMParentEdu} placeholder="secondary" span={2} />
                  <Field label="Parent Occupation" value={mParentJob} set={setMParentJob} placeholder="labor" span={2} />
                  <Field label="Parent Meetings" value={mParentMeet} set={setMParentMeet} type="number" placeholder="0" span={2} />
                  <Field label="Distance (km)" value={mDistance} set={setMDistance} type="number" placeholder="5" />
                  <Field label="Transport Available" value={mTransport} set={setMTransport} type="number" placeholder="1/0" />
                </div>
              </div>

              {/* Health & Wellness */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Health & Wellness
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Field label="Chronic Health Issues" value={mHealth} set={setMHealth} type="number" placeholder="1/0" span={2} />
                  <Field label="Nutrition Status" value={mNutrition} set={setMNutrition} placeholder="normal/poor" span={2} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
                <button 
                  type="button" 
                  onClick={()=>{setMId('');setMName('');setMClass('');setMAttendance('');setMScore('');setMFailed('');setMIncome('');setMParentEdu('');setMParentJob('');setMDistance('');setMTransport('');setMExtra('');setMDisciplinary('');setMHealth('');setMNutrition('');setMRatio('');setMParentMeet('');setMInterventions('');setMErr('');setSaveStatus('')}} 
                  className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear Form
                </button>
              </div>
              
              {/* Status Messages */}
              {mErr && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{mErr}</span>
                </div>
              )}
              {saveStatus && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{saveStatus}</span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Risk Level:</label>
              <select 
                value={risk} 
                onChange={e=>setRisk(e.target.value)} 
                className="bg-transparent border-none text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
            
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, class, or ID..."
                value={q}
                onChange={e=>setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportPredictionsCSV(filtered)}
              disabled={!filtered.length}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            
            {user?.role === 'teacher' && (
              <button
                onClick={async () => { 
                  const status = await saveTeacherToBackendOrLocal(user.name, students); 
                  exportStudentsCSV(students, `${user.name}.csv`); 
                  setSaveStatus(status.backend ? 'Saved to server' : 'Saved locally')
                  if (!status.backend) console.warn('[Upload] Save fallback local only.') 
                }}
                disabled={!students.length}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save & Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Prediction Results</h3>
                <p className="text-sm text-gray-500">
                  Showing {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                  {predictions.length !== filtered.length && ` of ${predictions.length} total`}
                </p>
              </div>
            </div>
            {predictions.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                <Users className="w-4 h-4" />
                {predictions.length} total
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <DataTable rows={filtered} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, set, placeholder='', type='text', required=false, span=1 }) {
  const cls = span===2 ? 'md:col-span-2' : span===3 ? 'md:col-span-3' : ''
  return (
    <div className={cls}>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        value={value}
        onChange={e=>set(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
