import React from 'react'

type Suggestion = { type: 'good' | 'improve'; tip: string }

type Props = {
  score: number
  suggestion?: Suggestion[]
  subtitle?: string
  description?: string
}

const ATS: React.FC<Props> = ({
  score,
  suggestion = [],
  subtitle = 'ATS Compatibility',
  description = 'This section evaluates how well your resume will pass automated applicant tracking systems (ATS).',
}) => {
  const s = Math.max(0, Math.min(100, Math.round(score ?? 0)))

  let fromClass = 'from-red-100'
  let icon = '/icons/ats-bad.svg'

  if (s > 69) {
    fromClass = 'from-green-100'
    icon = '/icons/ats-good.svg'
  } else if (s > 49) {
    fromClass = 'from-yellow-100'
    icon = '/icons/ats-warning.svg'
  }

  return (
    <div className={`rounded-xl p-4 bg-gradient-to-r ${fromClass} to-white/30 shadow-sm`}>
      <div className="flex items-center gap-4">
        <img src={icon} alt="ATS icon" className="w-12 h-12" />
        <div>
          <h3 className="text-lg font-semibold">ATS score - {s}/100</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {suggestion && suggestion.length > 0 && (
        <ul className="mt-3 space-y-2">
          {suggestion.map((sug, idx) => {
            const ic = sug.type === 'good' ? '/icons/check.svg' : '/icons/warnings.svg'
            return (
              <li key={idx} className="flex items-start gap-2">
                <img src={ic} alt={sug.type} className="w-5 h-5 mt-1" />
                <p className="text-sm text-gray-700">{sug.tip}</p>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4 text-sm text-gray-700">
        Keep refining — small, targeted changes can noticeably improve your ATS score.
      </div>
    </div>
  )
}

export default ATS