import { Lightbulb, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'

export default function SuggestionsPanel({ items, showHeader = false, variant = 'default' }) {
  if (!items?.length) return null

  return (
    <div className={`space-y-3 ${
      variant === 'compact' ? '' : 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200'
    }`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">AI-Powered Recommendations</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-gray-500">Personalized interventions</span>
              </div>
            </div>
          </div>
          <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI
          </span>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li 
            key={i} 
            className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="mt-0.5 p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md shadow-sm group-hover:scale-110 transition-transform duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="flex-1 text-sm text-gray-700 leading-relaxed">{s}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1" />
          </li>
        ))}
      </ul>
    </div>
  )
}
