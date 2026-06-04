import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { XIcon } from './Icons'

interface ModalProps {
  children: ReactNode
  onFechar: () => void
  titulo?: string
}

export default function Modal({ children, onFechar, titulo }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFechar])

  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4 anim-fade-in"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 anim-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {titulo && (
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">{titulo}</h2>
            <button
              onClick={onFechar}
              className="text-slate-500 hover:text-slate-200 transition-colors"
              aria-label="Fechar"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
