import { NivelPermissao } from '../types'

export const HIERARQUIA_PERMISSOES = [
  NivelPermissao.OPERADOR,
  NivelPermissao.ENGENHEIRO,
  NivelPermissao.ADMINISTRADOR,
] as const
