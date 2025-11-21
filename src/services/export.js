export function exportPredictionsCSV(predictions) {
  if (!predictions?.length) return
  const headers = [
    'id','name','class','probability','riskLevel','attendance','avg_score','behavior_flags','suggestions'
  ]
  const rows = predictions.map(p => [
    safe(p.id), safe(p.name), safe(p.class), p.probability,
    p.riskLevel, p.features?.attendance ?? '', p.features?.score ?? '',
    (p.features?.flags || []).join('|'), (p.suggestions || []).join(' | ')
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n')
  triggerDownload(csv, 'predictions.csv', 'text/csv;charset=utf-8;')
}

export function exportStudentsCSV(students, filename='students.csv') {
  if (!students?.length) return
  const headers = [
    'id','name','class','attendance_pct','grades_avg','num_failed_subjects','family_income_bracket','parent_education_level','parent_occupation','distance_to_school','transport_available','extracurricular_participation','disciplinary_records','chronic_health_issues','nutrition_status','teacher_student_ratio','parent_meeting_attendance','intervention_history'
  ]
  const rows = students.map(r => [
    safe(r.id), safe(r.name), safe(r.class), safe(r.attendance_pct ?? r.attendance ?? r.Attendance),
    safe(r.grades_avg ?? r.avg_score ?? r.AverageScore), safe(r.num_failed_subjects), safe(r.family_income_bracket), safe(r.parent_education_level), safe(r.parent_occupation),
    safe(r.distance_to_school), safe(r.transport_available), safe(r.extracurricular_participation), safe(r.disciplinary_records), safe(r.chronic_health_issues), safe(r.nutrition_status), safe(r.teacher_student_ratio), safe(r.parent_meeting_attendance), safe(r.intervention_history ?? r.behavior_flags)
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(csvEscape).join(','))].join('\n')
  triggerDownload(csv, filename, 'text/csv;charset=utf-8;')
}

function csvEscape(v){
  const s = String(v)
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}
function safe(v){ return v == null ? '' : v }

function triggerDownload(content, filename, type){
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
