// Prediction service utilities. Auto-detect backend on port 9999; fallback to heuristic.
// In Vite, env vars are accessed via import.meta.env
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : 'http://localhost:9999'
let backendAvailableChecked = false
let backendAvailable = false
let backendLastCheck = 0

async function checkBackend(force=false) {
  const now = Date.now()
  // Re-check if never checked, or previous result was false, or forced, or older than 10s
  if (!backendAvailableChecked || force || !backendAvailable || (now - backendLastCheck) > 10000) {
    try {
      const res = await fetch(API_BASE + '/', { method: 'GET' })
      backendAvailable = res.ok
    } catch (_) {
      backendAvailable = false
    }
    backendAvailableChecked = true
    backendLastCheck = now
  }
  return backendAvailable
}

export async function isBackendOnline({ force=false } = {}) {
  return await checkBackend(force)
}

export async function predictDropout(rows) {
  // Attempt backend bulk prediction first.
  if (await checkBackend()) {
    try {
      const backendResults = await backendPredictBulk(rows)
      if (backendResults && Array.isArray(backendResults) && backendResults.length) {
        return backendResults
      }
    } catch (e) {
      console.warn('Backend prediction failed, falling back to heuristic:', e)
    }
  }
  // Fallback heuristic.
  return heuristicPredict(rows)
}

// ---- Backend Data Persistence Helpers ----

export async function fetchTeacherData(teacherId) {
  if (!(await checkBackend())) return null
  const res = await fetch(`${API_BASE}/teacher/${encodeURIComponent(teacherId)}/data?predict=1`)
  if (!res.ok) throw new Error('Failed teacher fetch ' + res.status)
  const json = await res.json()
  return buildPredictionResponse(json)
}

export async function saveTeacherData(teacherId, students, mode='replace') {
  if (!(await checkBackend())) return null
  const res = await fetch(`${API_BASE}/teacher/${encodeURIComponent(teacherId)}/data?mode=${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(students || [])
  })
  if (!res.ok) throw new Error('Failed teacher save ' + res.status)
  const json = await res.json()
  return buildPredictionResponse(json)
}

export async function deleteStudent(teacherId, studentId) {
  if (!(await checkBackend())) return null
  const res = await fetch(`${API_BASE}/teacher/${encodeURIComponent(teacherId)}/student/${encodeURIComponent(studentId)}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete student ' + res.status)
  return await res.json()
}

export async function fetchPrincipalData() {
  if (!(await checkBackend())) return null
  const res = await fetch(`${API_BASE}/principal/data?predict=1`)
  if (!res.ok) throw new Error('Failed principal fetch ' + res.status)
  const json = await res.json()
  return buildPredictionResponse(json)
}

function buildPredictionResponse(payload){
  // Accept either array of records OR object with predictions array
  let records = []
  if (Array.isArray(payload)) {
    records = payload
  } else if (payload && Array.isArray(payload.predictions)) {
    // Teacher POST response wrapper
    records = payload.predictions
  } else {
    console.warn('Unexpected prediction response shape', payload)
    return { students: [], predictions: [] }
  }
  const students = records.map(r => ({ ...r }))
  const predictions = transformBackendPredictions(records)
  return { students, predictions }
}

async function backendPredictBulk(rows) {
  // Build CSV in memory matching backend expected columns.
  const columns = [
    'attendance_pct','grades_avg','num_failed_subjects','family_income_bracket','parent_education_level','parent_occupation','distance_to_school','transport_available','extracurricular_participation','disciplinary_records','chronic_health_issues','nutrition_status','teacher_student_ratio','parent_meeting_attendance','intervention_history'
  ]
  const header = columns.join(',')
  const lines = rows.map(r => columns.map(c => csvCell(r[c] ?? '')).join(','))
  const csv = header + '\n' + lines.join('\n')
  const form = new FormData()
  form.append('file', new Blob([csv], { type: 'text/csv' }), 'data.csv')
  const res = await fetch(API_BASE + '/predict_csv', { method: 'POST', body: form })
  if (!res.ok) throw new Error('Backend returned ' + res.status)
  const json = await res.json()
  // Merge backend probability & risk with local suggestions & identity fields
  return json.map((item, idx) => {
    const original = rows[idx] || {}
    const f = extractFeatures({ ...original, ...item })
    // Backend gives percent value
    const probability = toNum(item.dropout_probability_percent) / 100
    const riskLevel = normalizeRisk(item.risk_level)
    const suggestions = suggestActions(f, riskLevel)
    return {
      id: original.id ?? idx + 1,
      name: original.name ?? `Student ${idx + 1}`,
      class: original.class ?? 'N/A',
      probability: round(probability, 3),
      riskLevel,
      suggestions,
      features: f,
    }
  })
}

function transformBackendPredictions(records){
  return records.map((item, idx) => {
    const original = item // already includes id/name/class or maybe not
    const f = extractFeatures(item)
    const probability = toNum(item.dropout_probability_percent) / 100
    const riskLevel = normalizeRisk(item.risk_level)
    const suggestions = suggestActions(f, riskLevel)
    return {
      id: original.id ?? idx + 1,
      name: original.name ?? `Student ${idx + 1}`,
      class: original.class ?? 'N/A',
      probability: round(probability, 3),
      riskLevel,
      suggestions,
      features: f,
      teacher_id: original.teacher_id
    }
  })
}

function normalizeRisk(r) {
  if (!r) return 'Low'
  if (/high/i.test(r)) return 'High'
  if (/mod|medium/i.test(r)) return 'Medium'
  return 'Low'
}

function csvCell(v){
  const s = String(v ?? '').replace(/\r|\n/g,' ').trim()
  if (/[",]/.test(s)) return '"' + s.replace(/"/g,'""') + '"'
  return s
}

function heuristicPredict(rows){
  return rows.map((r, idx) => {
    const f = extractFeatures(r)
    const probability = computeProbability(f)
    const riskLevel = probability > 0.7 ? 'High' : probability > 0.4 ? 'Medium' : 'Low'
    const suggestions = suggestActions(f, riskLevel)
    return {
      id: r.id ?? r.ID ?? idx + 1,
      name: r.name ?? r.Name ?? `Student ${idx + 1}`,
      class: r.class ?? r.Class ?? r.Section ?? 'N/A',
      probability: round(probability, 3),
      riskLevel,
      suggestions,
      features: f,
    }
  })
}

function extractFeatures(r){
  return {
    attendance_pct: toNum(r.attendance_pct ?? r.attendance ?? r.Attendance),
    grades_avg: toNum(r.grades_avg ?? r.avg_score ?? r.AverageScore),
    num_failed_subjects: toNum(r.num_failed_subjects),
    family_income_bracket: str(r.family_income_bracket),
    parent_education_level: str(r.parent_education_level),
    parent_occupation: str(r.parent_occupation),
    distance_to_school: toNum(r.distance_to_school),
    transport_available: toNum(r.transport_available),
    extracurricular_participation: toNum(r.extracurricular_participation),
    disciplinary_records: toNum(r.disciplinary_records),
    chronic_health_issues: toNum(r.chronic_health_issues),
    nutrition_status: str(r.nutrition_status),
    teacher_student_ratio: toNum(r.teacher_student_ratio),
    parent_meeting_attendance: toNum(r.parent_meeting_attendance),
    intervention_history: str(r.intervention_history ?? r.behavior_flags),
  }
}

function computeProbability(f){
  // Weighted additive risk scoring converted to probability.
  let score = 0
  // Attendance: below 85 starts risk, strong under 70
  if (isFinite(f.attendance_pct)) score += (100 - f.attendance_pct) * 0.01
  // Grades: below 60 risk, harsher under 45
  if (isFinite(f.grades_avg)) score += Math.max(0, (60 - f.grades_avg) / 60) * 0.8
  // Failed subjects
  if (isFinite(f.num_failed_subjects)) score += Math.min(3, f.num_failed_subjects) * 0.12
  // Disciplinary records
  if (isFinite(f.disciplinary_records)) score += Math.min(5, f.disciplinary_records) * 0.08
  // Chronic health issues
  if (f.chronic_health_issues === 1) score += 0.15
  // Family income bracket
  if (/(low|lower)/i.test(f.family_income_bracket)) score += 0.18
  else if (/middle/i.test(f.family_income_bracket)) score += 0.08
  // Parent education level
  if (/(none|primary)/i.test(f.parent_education_level)) score += 0.12
  // Transport & distance
  if (isFinite(f.distance_to_school)) score += Math.min(f.distance_to_school/20, 1) * 0.1
  if (f.transport_available === 0 && f.distance_to_school > 5) score += 0.07
  // Extracurricular participation reduces risk
  if (f.extracurricular_participation === 1) score -= 0.08
  // Nutrition status
  if (/(under|mal)/i.test(f.nutrition_status)) score += 0.1
  // Parent meeting attendance low
  if (isFinite(f.parent_meeting_attendance)) score += Math.max(0, (3 - f.parent_meeting_attendance)) * 0.06
  // Teacher student ratio high
  if (isFinite(f.teacher_student_ratio)) score += Math.max(0, (f.teacher_student_ratio - 30) / 30) * 0.12
  // Intervention history may reduce risk if proactive
  if (/tutoring|counseling|mentorship/i.test(f.intervention_history)) score -= 0.05
  // Clamp and logistic squash
  score = clamp(score, -0.2, 2.5)
  const probability = 1/(1+Math.exp(-2*(score-0.9))) // shift center
  return clamp(probability, 0.01, 0.99)
}

function suggestActions(f, riskLevel){
  const out = []
  if (isFinite(f.attendance_pct) && f.attendance_pct < 80) out.push('Initiate attendance follow-up with guardians')
  if (isFinite(f.grades_avg) && f.grades_avg < 55) out.push('Enroll in remedial tutoring program')
  if (isFinite(f.num_failed_subjects) && f.num_failed_subjects >= 2) out.push('Design subject-specific recovery plan')
  if (f.extracurricular_participation === 0) out.push('Encourage joining one extracurricular activity')
  if (isFinite(f.disciplinary_records) && f.disciplinary_records > 0) out.push('Schedule behavior support counseling')
  if (f.chronic_health_issues === 1) out.push('Coordinate with health services for accommodations')
  if (/(low|lower)/i.test(f.family_income_bracket)) out.push('Assess need for financial aid or subsidies')
  if (/transport/i.test(f.intervention_history) || f.transport_available === 0) out.push('Review transport assistance options')
  if (/(under|mal)/i.test(f.nutrition_status)) out.push('Refer to nutrition support program')
  if (isFinite(f.parent_meeting_attendance) && f.parent_meeting_attendance < 2) out.push('Increase frequency of guardian engagement')
  if (riskLevel === 'High') out.push('Create individualized multi-factor intervention plan')
  if (out.length === 0) out.push('Maintain positive reinforcement and monitor monthly')
  return out
}

function toNum(v) { if (v===''||v==null) return NaN; const n = Number(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? NaN : n }
function round(x, d=2){ const m = Math.pow(10,d); return Math.round(x*m)/m }
function clamp(x, a, b){ return Math.max(a, Math.min(b, x)) }
function str(v){ return (v==null?'':String(v)).trim() }
