import React from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={`block w-full rounded-xl border ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-primary-400'
          } bg-white px-4 py-2.5 text-sm shadow-sm
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors resize-none ${className}`}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
