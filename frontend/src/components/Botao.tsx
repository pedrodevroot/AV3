import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante =
  | 'primario'
  | 'secundario'
  | 'sucesso'
  | 'aviso'
  | 'escuro'
  | 'fantasma'

type Tamanho = 'sm' | 'md' | 'lg'

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamanho?: Tamanho
  iconeEsquerda?: ReactNode
  iconeDireita?: ReactNode
  carregando?: boolean
  children?: ReactNode
}

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/40 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-px',
  secundario:
    'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600',
  sucesso:
    'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 shadow-lg shadow-emerald-600/20',
  aviso:
    'bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-lg shadow-amber-500/20',
  escuro:
    'bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-700/60',
  fantasma: '',
}

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Botao({
  variante = 'primario',
  tamanho = 'md',
  iconeEsquerda,
  iconeDireita,
  carregando,
  children,
  type = 'button',
  className = '',
  disabled,
  ...props
}: BotaoProps) {
  if (variante === 'fantasma') {
    return (
      <button
        type={type}
        disabled={disabled || carregando}
        className={`inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:pointer-events-none ${className}`}
        {...props}
      >
        {iconeEsquerda}
        {children}
        {iconeDireita}
      </button>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`}
      {...props}
    >
      {carregando ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconeEsquerda
      )}
      {children}
      {!carregando && iconeDireita}
    </button>
  )
}
