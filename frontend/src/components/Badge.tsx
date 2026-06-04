import type { ReactNode } from 'react'

type Tom =
  | 'neutro'
  | 'info'
  | 'sucesso'
  | 'aviso'
  | 'perigo'
  | 'pendente'

interface BadgeProps {
  children: ReactNode
  tom?: Tom
  className?: string
}

const TONS: Record<Tom, string> = {
  neutro: 'bg-slate-800/60 text-slate-300 border-slate-700',
  info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  sucesso: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  aviso: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  perigo: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  pendente: 'bg-slate-700/30 text-slate-400 border-slate-600/50',
}

export default function Badge({ children, tom = 'neutro', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TONS[tom]} ${className}`}
    >
      {children}
    </span>
  )
}
