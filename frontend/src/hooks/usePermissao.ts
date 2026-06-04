import { useAuth } from '../contexts/AuthContext'
import { NivelPermissao } from '../types'
import { HIERARQUIA_PERMISSOES } from '../constants/permissoes'

export function usePermissao() {
  const { usuario } = useAuth()

  function temPermissao(nivel: NivelPermissao): boolean {
    if (!usuario) return false
    return (
      HIERARQUIA_PERMISSOES.indexOf(usuario.nivelPermissao) >=
      HIERARQUIA_PERMISSOES.indexOf(nivel)
    )
  }

  return {
    usuario,
    podeOperar: temPermissao(NivelPermissao.OPERADOR),
    podeEngenhar: temPermissao(NivelPermissao.ENGENHEIRO),
    podeAdministrar: temPermissao(NivelPermissao.ADMINISTRADOR),
    temPermissao,
  }
}
