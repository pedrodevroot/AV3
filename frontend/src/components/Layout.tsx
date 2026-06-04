import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ArrowLeftIcon } from './Icons'

interface LayoutProps {
  titulo: ReactNode
  subtitulo?: ReactNode
  voltar?: string
  acoes?: ReactNode
  abaixo?: ReactNode
  children: ReactNode
}

export default function Layout({
  titulo,
  subtitulo,
  voltar,
  acoes,
  abaixo,
  children,
}: LayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden">
        <div className="px-8 py-8 max-w-7xl">
          {voltar && (
            <button
              onClick={() => navigate(voltar)}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Voltar
            </button>
          )}

          <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
                {titulo}
              </h1>
              {subtitulo && (
                <p className="text-sm text-slate-400 mt-1">{subtitulo}</p>
              )}
            </div>
            {acoes && <div className="flex items-center gap-2">{acoes}</div>}
          </div>

          {abaixo && (
            <div className="mt-6 border-b border-slate-800">{abaixo}</div>
          )}

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
