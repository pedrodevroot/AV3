import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
  className?: string
}

export default function Card({
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  const base = 'bg-slate-900 border border-slate-800 rounded-lg'
  const hover = hoverable
    ? 'transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-cyan-500/5'
    : ''

  return (
    <div className={`${base} ${hover} ${className}`} {...props}>
      {children}
    </div>
  )
}
