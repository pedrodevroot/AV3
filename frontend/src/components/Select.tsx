import { ChevronDownIcon } from './Icons'

interface OpcaoSelect {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  value: string
  onChange: (v: string) => void
  opcoes: OpcaoSelect[]
  id?: string
}

let idCounter = 0

export default function Select({ label, value, onChange, opcoes, id }: SelectProps) {
  const generatedId = id ?? `select-${++idCounter}`

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
      <div className="relative">
        <select
          id={generatedId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2.5 pr-10 text-sm text-slate-100 transition-colors focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none cursor-pointer"
        >
          {opcoes.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-900 text-slate-100">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  )
}
