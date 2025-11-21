import { predictDropout, isBackendOnline, fetchTeacherData, saveTeacherData } from './api'

const KEY_PREFIX = 'dropoutshield-teacher-'

export function saveTeacherStudents(username, students) {
  if (!username) return
  try {
    localStorage.setItem(KEY_PREFIX + username, JSON.stringify(students || []))
    return true
  } catch (e) {
    console.error('Failed to save teacher data', e)
    return false
  }
}

export function loadTeacherStudents(username) {
  if (!username) return []
  try {
    const raw = localStorage.getItem(KEY_PREFIX + username)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load teacher data', e)
    return []
  }
}

export async function loadTeacherToStore(username, setDataset, setPredictions) {
  if (!username) return
  
  // Try loading from CSV first
  try {
    const csvRows = await loadDbCsvTeachers([username])
    if (csvRows && csvRows.length) {
      const predictions = await predictDropout(csvRows)
      setDataset(csvRows)
      setPredictions(predictions)
      return
    }
  } catch (e) {
    console.warn('CSV load failed for teacher, trying backend', e)
  }
  
  // Fallback: Prefer authoritative backend fetch. Force a fresh check.
  if (await isBackendOnline({ force: true })) {
    try {
      const resp = await fetchTeacherData(username)
      if (resp) {
        setDataset(resp.students)
        setPredictions(resp.predictions)
        return
      }
    } catch (e) {
      console.warn('Backend teacher fetch failed', e)
      // If backend fails after being reachable, fall through to localStorage
    }
  }
  
  // Final fallback: try localStorage
  const localRows = loadTeacherStudents(username)
  if (localRows && localRows.length) {
    const predictions = await predictDropout(localRows)
    setDataset(localRows)
    setPredictions(predictions)
    return
  }
  
  // Nothing available: clear dataset
  setDataset([])
  setPredictions([])
}

export async function saveTeacherToBackendOrLocal(username, students) {
  if (!username) return { backend: false, savedLocal: false }
  if (await isBackendOnline()) {
    try {
      const resp = await saveTeacherData(username, students, 'replace')
      return { backend: true, savedLocal: false, response: resp }
    } catch (e) {
      console.warn('Backend save failed, persisting local only', e)
    }
  }
  const ok = saveTeacherStudents(username, students)
  return { backend: false, savedLocal: ok }
}

// Try loading CSV files from the project's `/db` directory (served by dev/build server).
// Returns array of parsed row objects, or [] if none available or fetch fails.
export async function loadDbCsvTeachers(teacherIds = []) {
  if (!Array.isArray(teacherIds) || teacherIds.length === 0) return []
  const out = []
  for (const id of teacherIds) {
    try {
      const rows = await loadDbCsv(id)
      // attach teacher id for provenance
      rows.forEach(r => { r.teacher_id = id })
      out.push(...rows)
    } catch (e) {
      // ignore missing files
      console.warn('Failed loading db CSV for', id, e)
    }
  }
  return out
}

async function loadDbCsv(id) {
  const url = `/db/${id}.csv`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Not found')
  const text = await res.text()
  return parseCsv(text)
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n')
  if (!lines.length) return []
  // find header line (first non-empty)
  let headerLineIndex = 0
  while (headerLineIndex < lines.length && lines[headerLineIndex].trim() === '') headerLineIndex++
  if (headerLineIndex >= lines.length) return []
  const header = parseCsvLine(lines[headerLineIndex])
  const rows = []
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') continue
    const cols = parseCsvLine(line)
    const obj = {}
    for (let j = 0; j < header.length; j++) {
      const key = header[j] || `col${j}`
      obj[key.trim()] = cols[j] === undefined ? '' : cols[j]
    }
    rows.push(obj)
  }
  return rows
}

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i+1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { out.push(cur); cur = '' }
      else { cur += ch }
    }
  }
  out.push(cur)
  return out
}
