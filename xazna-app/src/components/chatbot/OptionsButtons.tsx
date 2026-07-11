import React from 'react'
import type { ChatOption } from '../../types'

interface Props {
  options: ChatOption[]
  onSelect: (option: ChatOption) => void
  disabled?: boolean
  selectedValue?: string
}

export const OptionsButtons: React.FC<Props> = ({
  options,
  onSelect,
  disabled = false,
  selectedValue,
}) => {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt)}
            disabled={disabled}
            className={`
              relative overflow-hidden px-5 py-3 rounded-xl font-medium text-sm
              transition-all duration-200
              ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-400 hover:text-primary-600 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
            `}
          >
            <span className="flex items-center gap-2">
              {opt.icon && <span className="text-lg">{opt.icon}</span>}
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
