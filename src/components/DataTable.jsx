import { useState } from 'react'
import RiskBadge from './RiskBadge'
import StudentModal from './StudentModal'
import { User, GraduationCap, TrendingUp, Eye, ChevronRight } from 'lucide-react'

export default function DataTable({ rows }) {
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy] = useState('probability')
  const [sortOrder, setSortOrder] = useState('desc')

  if (!rows?.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center border border-gray-200">
        <div className="inline-flex p-4 bg-gray-200 rounded-full mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No student data yet</p>
        <p className="text-sm text-gray-500 mt-2">Upload a CSV file to get started with predictions</p>
      </div>
    )
  }

  const sortedRows = [...rows].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1
    if (sortBy === 'probability') return (b.probability - a.probability) * order
    if (sortBy === 'name') return a.name.localeCompare(b.name) * order
    return 0
  })

  return (
    <>
      <div className="space-y-4">
        {/* Header with sort controls */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Student Predictions</h3>
              <p className="text-sm text-gray-500">{rows.length} students analyzed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="probability">Risk Level</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Key Actions</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRows.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">ID: {r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      {r.class}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-900">{Math.round(r.probability * 100)}%</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              r.riskLevel === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              r.riskLevel === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                              'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            }`}
                            style={{ width: `${r.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RiskBadge level={r.riskLevel} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md line-clamp-2">
                      {r.suggestions.slice(0, 2).join(' • ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {sortedRows.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {r.class}
                    </div>
                  </div>
                </div>
                <RiskBadge level={r.riskLevel} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900">{Math.round(r.probability * 100)}%</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden ml-2">
                  <div 
                    className={`h-full rounded-full ${
                      r.riskLevel === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      r.riskLevel === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                      'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${r.probability * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-600 line-clamp-2">
                {r.suggestions.slice(0, 2).join(' • ')}
              </div>
              <div className="flex items-center justify-end mt-2 text-blue-600 text-sm font-medium">
                View Details <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </>
  )
}
