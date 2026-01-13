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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="0"
          max="100"
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
        />
        <input
          type="number"
          min="0"
          max="100"
          value={localValue}
          onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
          disabled={disabled}
          className="w-16 p-2 text-center border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0 (Poor)</span>
        <span>50 (Average)</span>
        <span>100 (Excellent)</span>
      </div>
    </div>
  )
}
