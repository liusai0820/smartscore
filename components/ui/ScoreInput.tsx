'use client'

import { useState, useEffect } from 'react'

interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: number) => {
    if (newValue < 0) newValue = 0
    if (newValue > 100) newValue = 100
    setLocalValue(newValue)
    onChange(newValue)
  }

  // 计算分数对应的颜色
  const getScoreColor = () => {
    if (localValue >= 80) return '#7ec699' // 优秀 - 翡翠绿
    if (localValue >= 60) return '#5fb3b3' // 良好 - 青瓷蓝
    if (localValue >= 40) return '#d4a853' // 中等 - 琥珀金
    return '#e85a5a' // 待提升 - 朱砂红
  }

  const getScoreLabel = () => {
    if (localValue >= 80) return '优秀'
    if (localValue >= 60) return '良好'
    if (localValue >= 40) return '中等'
    return '待提升'
  }

  return (
    <div className="space-y-3">
      {/* 滑块区域 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          {/* 滑块轨道背景 */}
          <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 rounded-full bg-[#21262d]" />
          {/* 滑块进度条 */}
          <div
            className="absolute h-2 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150"
            style={{
              width: `${localValue}%`,
              background: `linear-gradient(90deg, ${getScoreColor()}80 0%, ${getScoreColor()} 100%)`
            }}
          />
          {/* 滑块输入 */}
          <input
            type="range"
            min="0"
            max="100"
            value={localValue}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            disabled={disabled}
            className="relative w-full h-8 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10"
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
        </div>
        {/* 数字输入框 */}
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={localValue}
            onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-16 h-10 text-center text-lg font-bold rounded-lg bg-[#21262d] border border-[#30363d] text-[#f5f1eb] focus:outline-none focus:border-[#d4a853] focus:ring-1 focus:ring-[#d4a853]/50 disabled:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* 分数标签 */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex gap-4 text-[#6e7681]">
          <span>0 较差</span>
          <span>50 中等</span>
          <span>100 优秀</span>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
          style={{
            backgroundColor: `${getScoreColor()}20`,
            color: getScoreColor(),
            borderColor: `${getScoreColor()}30`,
            borderWidth: '1px'
          }}
        >
          {getScoreLabel()}
        </div>
      </div>
    </div>
  )
}
