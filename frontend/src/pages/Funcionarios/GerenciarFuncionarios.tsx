import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useDados } from '../../contexts/DadosContext'
import { NivelPermissao } from '../../types'
import type { Funcionario } from '../../types'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import Botao from '../../components/Botao'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Badge from '../../components/Badge'
import { PlusIcon, UsersIcon, AlertTriangleIcon } from '../../components/Icons'

export default function GerenciarFuncionarios() {
  const { usuario } = useAuth()
  const { funcionarios, adicionarFuncionario } = useDados()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)

  if (usuario?.nivelPermissao !== NivelPermissao.ADMINISTRADOR) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-6 h-6 text-rose-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-100 mb-1">
            Acesso negado
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Apenas administradores podem acessar esta página.
          </p>
          <Botao onClick={() => navigate('/aeronaves')}>Voltar</Botao>
        </Card>
      </div>
    )
  }

  const subtitulo =
    funcionarios.length === 1
      ? '1 funcionário cadastrado'
      : `${funcionarios.length} funcionários cadastrados`

  return (
    <Layout
      titulo="Funcionários"
      subtitulo={subtitulo}
      acoes={
        <Botao
          iconeEsquerda={<PlusIcon className="w-4 h-4" />}
          onClick={() => setModalAberto(true)}
        >
          Cadastrar Funcionário
        </Botao>
      }
    >
      {funcionarios.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <UsersIcon className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-base font-medium text-slate-200 mb-1">
            Nenhum funcionário cadastrado
          </h3>
          <p className="text-sm text-slate-500">
            Comece adicionando um funcionário ao sistema.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800">
                <tr>
                  <Th>Funcionário</Th>
                  <Th>Usuário</Th>
                  <Th>Nível</Th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-cyan-500/20">
                          {f.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-100">{f.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {f.usuario}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tom={tomNivel(f.nivelPermissao)}>
                        {f.nivelPermissao}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalAberto && (
        <ModalCadastro
          funcionarios={funcionarios}
          onSalvar={adicionarFuncionario}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </Layout>
  )
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
      {children}
    </th>
  )
}

function tomNivel(nivel: NivelPermissao) {
  if (nivel === NivelPermissao.ADMINISTRADOR) return 'info'
  if (nivel === NivelPermissao.ENGENHEIRO) return 'sucesso'
  return 'neutro'
}

function ModalCadastro({
  funcionarios,
  onSalvar,
  onFechar,
}: {
  funcionarios: Funcionario[]
  onSalvar: (f: Funcionario) => void
  onFechar: () => void
}) {
  const [id, setId] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [nivel, setNivel] = useState<NivelPermissao>(NivelPermissao.OPERADOR)
  const [erro, setErro] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (funcionarios.some((f) => f.id === id)) {
      setErro('Já existe um funcionário com esse ID.')
      return
    }
    if (funcionarios.some((f) => f.usuario === usuario)) {
      setErro('Já existe um funcionário com esse usuário.')
      return
    }

    onSalvar({
      id,
      nome,
      telefone,
      endereco,
      usuario,
      senha,
      nivelPermissao: nivel,
    })
    onFechar()
  }

  return (
    <Modal onFechar={onFechar} titulo="Cadastrar funcionário">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="ID" value={id} onChange={setId} required />
          <Input label="Nome" value={nome} onChange={setNome} required />
        </div>
        <Input
          label="Telefone"
          value={telefone}
          onChange={setTelefone}
          required
        />
        <Input
          label="Endereço"
          value={endereco}
          onChange={setEndereco}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Usuário"
            value={usuario}
            onChange={setUsuario}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={setSenha}
            required
          />
        </div>
        <Select
          label="Nível"
          value={nivel}
          onChange={(v) => setNivel(v as NivelPermissao)}
          opcoes={[
            { value: NivelPermissao.OPERADOR, label: 'Operador' },
            { value: NivelPermissao.ENGENHEIRO, label: 'Engenheiro' },
            { value: NivelPermissao.ADMINISTRADOR, label: 'Administrador' },
          ]}
        />

        {erro && (
          <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-md text-sm text-rose-300">
            {erro}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Botao variante="secundario" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao type="submit">Salvar</Botao>
        </div>
      </form>
    </Modal>
  )
}
