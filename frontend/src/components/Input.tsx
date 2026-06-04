import type { InputHTMLAttributes } from 'react'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string
  value: string
  onChange: (valor: string) => void
  erro?: string
}

let idCounter = 0

export default function Input({
  label,
  value,
  onChange,
  erro,
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = id ?? `input-${++idCounter}`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className="text-[11px] font-medium text-slate-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={generatedId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-slate-950 border rounded-md px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors
          ${erro ? 'border-rose-500/60 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500'}
          focus:outline-none focus:ring-2 focus:ring-cyan-500/20
          ${className}`}
        {...props}
      />
      {erro && <p className="text-xs text-rose-400">{erro}</p>}
    </div>
  )
}
