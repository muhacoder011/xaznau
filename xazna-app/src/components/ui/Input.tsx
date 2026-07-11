import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`block w-full rounded-xl border ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-primary-400'
          } bg-white px-4 py-2.5 text-sm shadow-sm 
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
