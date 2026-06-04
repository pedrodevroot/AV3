import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { NivelPermissao } from '../types'
import Logo from './Logo'
import { PlaneIcon, UsersIcon, LogOutIcon } from './Icons'

export default function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const ehAdmin = usuario?.nivelPermissao === NivelPermissao.ADMINISTRADOR
  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="px-4 pt-5 pb-4 border-b border-slate-800/80">
        <Logo size="xl" className="rounded-md" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <ItemNav to="/aeronaves" icone={<PlaneIcon className="w-4 h-4" />}>
          Aeronaves
        </ItemNav>
        {ehAdmin && (
          <ItemNav to="/funcionarios" icone={<UsersIcon className="w-4 h-4" />}>
            Funcionários
          </ItemNav>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800/80">
        {usuario && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md shadow-cyan-500/20">
              {inicial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-100 truncate leading-tight">
                {usuario.nome}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                {usuario.nivelPermissao}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

function ItemNav({
  to,
  icone,
  children,
}: {
  to: string
  icone: ReactNode
  children: ReactNode
}) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className={
            'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ' +
            (isActive
              ? 'bg-cyan-500/10 text-cyan-300'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60')
          }
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-md shadow-cyan-400/50" />
          )}
          {icone}
          <span className="font-medium">{children}</span>
        </div>
      )}
    </NavLink>
  )
}
