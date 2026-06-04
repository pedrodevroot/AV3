import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePermissao } from '../../hooks/usePermissao'
import { useDados } from '../../contexts/DadosContext'
import {
  TipoPeca,
  StatusPeca,
  StatusEtapa,
  TipoTeste,
  ResultadoTeste,
} from '../../types'
import type { Aeronave, Funcionario } from '../../types'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import Botao from '../../components/Botao'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Badge from '../../components/Badge'
import {
  PackageIcon,
  ListChecksIcon,
  ActivityIcon,
  AlertTriangleIcon,
  PlusIcon,
  PlayIcon,
  CheckIcon,
  UsersIcon,
  DownloadIcon,
} from '../../components/Icons'

type Aba = 'pecas' | 'etapas' | 'testes'

type ModalState =
  | { tipo: 'adicionarPeca' }
  | { tipo: 'atualizarStatusPeca'; indice: number }
  | { tipo: 'adicionarEtapa' }
  | { tipo: 'associarFuncionario'; indice: number }
  | { tipo: 'adicionarTeste' }
  | null

export default function AeronaveDetalhes() {
  const { codigo } = useParams<{ codigo: string }>()
  const { podeOperar, podeEngenhar, podeAdministrar } = usePermissao()
  const {
    aeronaves,
    funcionarios,
    adicionarPeca,
    adicionarEtapa,
    adicionarTeste,
    iniciarEtapa,
    finalizarEtapa,
    atualizarStatusPeca,
    associarFuncionarioEtapa,
  } = useDados()
  const navigate = useNavigate()

  const aeronave = aeronaves.find((a) => a.codigo === codigo)

  const [aba, setAba] = useState<Aba>('pecas')
  const [modal, setModal] = useState<ModalState>(null)
  const [aviso, setAviso] = useState('')
  const [turboAtivo, setTurboAtivo] = useState(false)

  function ativarTurbo() {
    setTurboAtivo(true)
    window.setTimeout(() => setTurboAtivo(false), 2200)
  }

  if (!aeronave) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-6 h-6 text-slate-500" />
          </div>
          <h1 className="text-lg font-semibold text-slate-100 mb-1">
            Aeronave não encontrada
          </h1>
          <p className="text-sm text-slate-400 mb-5">
            Não há registro com o código informado.
          </p>
          <Botao onClick={() => navigate('/aeronaves')}>Voltar</Botao>
        </Card>
      </div>
    )
  }

  function handleIniciarEtapa(indice: number) {
    const ok = iniciarEtapa(aeronave!.codigo, indice)
    if (!ok) setAviso('Não foi possível iniciar a etapa.')
  }

  function handleFinalizarEtapa(indice: number) {
    const ok = finalizarEtapa(aeronave!.codigo, indice)
    if (!ok) setAviso('A etapa anterior ainda não foi concluída.')
  }

  function handleGerarRelatorio() {
    const texto = montarRelatorio(aeronave!)
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${aeronave!.codigo}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {turboAtivo && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow-2xl shadow-cyan-500/40 ring-1 ring-cyan-300/40 animate-pulse">
          🚀 Modo Turbo ativado
        </div>
      )}
      <Layout
      titulo={
        <span className="inline-flex items-center gap-3">
          <span
            onDoubleClick={ativarTurbo}
            className="select-none cursor-pointer"
          >
            {aeronave.modelo}
          </span>
          <span className="text-base font-mono font-normal text-slate-500">
            {aeronave.codigo}
          </span>
          <Badge tom={aeronave.tipo === 'COMERCIAL' ? 'info' : 'aviso'}>
            {aeronave.tipo}
          </Badge>
        </span>
      }
      subtitulo={`${aeronave.capacidade} passageiros · ${aeronave.alcance} km de alcance`}
      voltar="/aeronaves"
      acoes={
        podeEngenhar && (
          <Botao
            variante="sucesso"
            iconeEsquerda={<DownloadIcon className="w-4 h-4" />}
            onClick={handleGerarRelatorio}
          >
            Gerar relatório
          </Botao>
        )
      }
      abaixo={
        <div className="flex gap-1">
          <Tab
            ativo={aba === 'pecas'}
            onClick={() => setAba('pecas')}
            icone={<PackageIcon className="w-4 h-4" />}
            label="Peças"
            contador={aeronave.pecas.length}
          />
          <Tab
            ativo={aba === 'etapas'}
            onClick={() => setAba('etapas')}
            icone={<ListChecksIcon className="w-4 h-4" />}
            label="Etapas"
            contador={aeronave.etapas.length}
          />
          <Tab
            ativo={aba === 'testes'}
            onClick={() => setAba('testes')}
            icone={<ActivityIcon className="w-4 h-4" />}
            label="Testes"
            contador={aeronave.testes.length}
          />
        </div>
      }
    >
      {aviso && (
        <div className="mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-200">
            <AlertTriangleIcon className="w-4 h-4 shrink-0" />
            <span>{aviso}</span>
          </div>
          <button
            onClick={() => setAviso('')}
            className="text-xs text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            fechar
          </button>
        </div>
      )}

      {aba === 'pecas' && (
        <SecaoPecas
          aeronave={aeronave}
          podeOperar={podeOperar}
          onAdicionar={() => setModal({ tipo: 'adicionarPeca' })}
          onAtualizarStatus={(indice) =>
            setModal({ tipo: 'atualizarStatusPeca', indice })
          }
        />
      )}

      {aba === 'etapas' && (
        <SecaoEtapas
          aeronave={aeronave}
          podeEngenhar={podeEngenhar}
          podeAdministrar={podeAdministrar}
          onAdicionar={() => setModal({ tipo: 'adicionarEtapa' })}
          onIniciar={handleIniciarEtapa}
          onFinalizar={handleFinalizarEtapa}
          onAssociar={(indice) =>
            setModal({ tipo: 'associarFuncionario', indice })
          }
        />
      )}

      {aba === 'testes' && (
        <SecaoTestes
          aeronave={aeronave}
          podeEngenhar={podeEngenhar}
          onAdicionar={() => setModal({ tipo: 'adicionarTeste' })}
        />
      )}

      {modal && (
        <Modal
          onFechar={() => setModal(null)}
          titulo={tituloModal(modal, aeronave)}
        >
          {modal.tipo === 'adicionarPeca' && (
            <FormAdicionarPeca
              onSalvar={(peca) => {
                adicionarPeca(aeronave.codigo, peca)
                setModal(null)
              }}
              onCancelar={() => setModal(null)}
            />
          )}

          {modal.tipo === 'atualizarStatusPeca' && (
            <FormAtualizarStatusPeca
              statusAtual={aeronave.pecas[modal.indice]!.status}
              onSalvar={(status) => {
                atualizarStatusPeca(aeronave.codigo, modal.indice, status)
                setModal(null)
              }}
              onCancelar={() => setModal(null)}
            />
          )}

          {modal.tipo === 'adicionarEtapa' && (
            <FormAdicionarEtapa
              onSalvar={(etapa) => {
                adicionarEtapa(aeronave.codigo, etapa)
                setModal(null)
              }}
              onCancelar={() => setModal(null)}
            />
          )}

          {modal.tipo === 'associarFuncionario' && (
            <FormAssociarFuncionario
              funcionarios={funcionarios}
              onSalvar={(funcionarioId) => {
                associarFuncionarioEtapa(
                  aeronave.codigo,
                  modal.indice,
                  funcionarioId
                )
                setModal(null)
              }}
              onCancelar={() => setModal(null)}
            />
          )}

          {modal.tipo === 'adicionarTeste' && (
            <FormAdicionarTeste
              onSalvar={(teste) => {
                adicionarTeste(aeronave.codigo, teste)
                setModal(null)
              }}
              onCancelar={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </Layout>
    </>
  )
}

function tituloModal(modal: NonNullable<ModalState>, a: Aeronave): string {
  switch (modal.tipo) {
    case 'adicionarPeca':
      return 'Adicionar peça'
    case 'atualizarStatusPeca':
      return `Status — ${a.pecas[modal.indice]?.nome ?? ''}`
    case 'adicionarEtapa':
      return 'Adicionar etapa'
    case 'associarFuncionario':
      return 'Associar funcionário'
    case 'adicionarTeste':
      return 'Adicionar teste'
  }
}

function Tab({
  ativo,
  onClick,
  icone,
  label,
  contador,
}: {
  ativo: boolean
  onClick: () => void
  icone: ReactNode
  label: string
  contador: number
}) {
  return (
    <button
      onClick={onClick}
      className={
        'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ' +
        (ativo
          ? 'border-cyan-400 text-cyan-300'
          : 'border-transparent text-slate-400 hover:text-slate-200')
      }
    >
      {icone}
      <span>{label}</span>
      <span
        className={
          'text-[10px] px-1.5 py-0.5 rounded-full ' +
          (ativo
            ? 'bg-cyan-500/20 text-cyan-300'
            : 'bg-slate-800 text-slate-500')
        }
      >
        {contador}
      </span>
    </button>
  )
}

function SecaoVazia({ icone, texto }: { icone: ReactNode; texto: string }) {
  return (
    <Card className="p-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
        {icone}
      </div>
      <p className="text-sm text-slate-400">{texto}</p>
    </Card>
  )
}

function SecaoPecas({
  aeronave,
  podeOperar,
  onAdicionar,
  onAtualizarStatus,
}: {
  aeronave: Aeronave
  podeOperar: boolean
  onAdicionar: () => void
  onAtualizarStatus: (indice: number) => void
}) {
  return (
    <div>
      {podeOperar && (
        <div className="mb-4 flex justify-end">
          <Botao
            iconeEsquerda={<PlusIcon className="w-4 h-4" />}
            onClick={onAdicionar}
            tamanho="sm"
          >
            Adicionar peça
          </Botao>
        </div>
      )}

      {aeronave.pecas.length === 0 ? (
        <SecaoVazia
          icone={<PackageIcon className="w-6 h-6 text-slate-500" />}
          texto="Nenhuma peça cadastrada."
        />
      ) : (
        <Card className="overflow-hidden divide-y divide-slate-800">
          {aeronave.pecas.map((p, i) => (
            <div
              key={i}
              className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <PackageIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-100 truncate">{p.nome}</p>
                  <p className="text-xs text-slate-500">
                    {p.tipo} · {p.fornecedor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge tom={tomStatusPeca(p.status)}>{p.status}</Badge>
                {podeOperar && (
                  <Botao
                    variante="fantasma"
                    onClick={() => onAtualizarStatus(i)}
                  >
                    Mudar status
                  </Botao>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function tomStatusPeca(status: StatusPeca) {
  if (status === StatusPeca.PRONTA) return 'sucesso'
  if (status === StatusPeca.EM_TRANSPORTE) return 'info'
  return 'pendente'
}

function SecaoEtapas({
  aeronave,
  podeEngenhar,
  podeAdministrar,
  onAdicionar,
  onIniciar,
  onFinalizar,
  onAssociar,
}: {
  aeronave: Aeronave
  podeEngenhar: boolean
  podeAdministrar: boolean
  onAdicionar: () => void
  onIniciar: (indice: number) => void
  onFinalizar: (indice: number) => void
  onAssociar: (indice: number) => void
}) {
  return (
    <div>
      {podeEngenhar && (
        <div className="mb-4 flex justify-end">
          <Botao
            iconeEsquerda={<PlusIcon className="w-4 h-4" />}
            onClick={onAdicionar}
            tamanho="sm"
          >
            Adicionar etapa
          </Botao>
        </div>
      )}

      {aeronave.etapas.length === 0 ? (
        <SecaoVazia
          icone={<ListChecksIcon className="w-6 h-6 text-slate-500" />}
          texto="Nenhuma etapa cadastrada."
        />
      ) : (
        <div className="space-y-2">
          {aeronave.etapas.map((e, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">{e.nome}</p>
                    <p className="text-xs text-slate-500">Prazo: {e.prazo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tom={tomStatusEtapa(e.status)}>{e.status}</Badge>
                  {podeEngenhar && e.status === StatusEtapa.PENDENTE && (
                    <Botao
                      variante="aviso"
                      tamanho="sm"
                      iconeEsquerda={<PlayIcon className="w-3 h-3" />}
                      onClick={() => onIniciar(i)}
                    >
                      Iniciar
                    </Botao>
                  )}
                  {podeEngenhar && e.status === StatusEtapa.ANDAMENTO && (
                    <Botao
                      variante="sucesso"
                      tamanho="sm"
                      iconeEsquerda={<CheckIcon className="w-3 h-3" />}
                      onClick={() => onFinalizar(i)}
                    >
                      Finalizar
                    </Botao>
                  )}
                  {podeAdministrar && (
                    <Botao
                      variante="escuro"
                      tamanho="sm"
                      iconeEsquerda={<UsersIcon className="w-3 h-3" />}
                      onClick={() => onAssociar(i)}
                    >
                      Associar
                    </Botao>
                  )}
                </div>
              </div>

              {e.funcionarios.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                    Funcionários ({e.funcionarios.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {e.funcionarios.map((f) => (
                      <div
                        key={f.id}
                        className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 rounded-full pl-1 pr-3 py-0.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-semibold">
                          {f.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-300">{f.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function tomStatusEtapa(status: StatusEtapa) {
  if (status === StatusEtapa.CONCLUIDA) return 'sucesso'
  if (status === StatusEtapa.ANDAMENTO) return 'info'
  return 'pendente'
}

function SecaoTestes({
  aeronave,
  podeEngenhar,
  onAdicionar,
}: {
  aeronave: Aeronave
  podeEngenhar: boolean
  onAdicionar: () => void
}) {
  return (
    <div>
      {podeEngenhar && (
        <div className="mb-4 flex justify-end">
          <Botao
            iconeEsquerda={<PlusIcon className="w-4 h-4" />}
            onClick={onAdicionar}
            tamanho="sm"
          >
            Adicionar teste
          </Botao>
        </div>
      )}

      {aeronave.testes.length === 0 ? (
        <SecaoVazia
          icone={<ActivityIcon className="w-6 h-6 text-slate-500" />}
          texto="Nenhum teste cadastrado."
        />
      ) : (
        <Card className="overflow-hidden divide-y divide-slate-800">
          {aeronave.testes.map((t, i) => (
            <div
              key={i}
              className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <ActivityIcon className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-slate-100 font-medium">{t.tipo}</span>
              </div>
              <Badge
                tom={
                  t.resultado === ResultadoTeste.APROVADO ? 'sucesso' : 'perigo'
                }
              >
                {t.resultado}
              </Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function FormAdicionarPeca({
  onSalvar,
  onCancelar,
}: {
  onSalvar: (peca: {
    nome: string
    tipo: TipoPeca
    fornecedor: string
    status: StatusPeca
  }) => void
  onCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<TipoPeca>(TipoPeca.NACIONAL)
  const [fornecedor, setFornecedor] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSalvar({ nome, tipo, fornecedor, status: StatusPeca.EM_PRODUCAO })
  }

  return (
    <FormShell onSubmit={handleSubmit} onCancelar={onCancelar}>
      <Input label="Nome" value={nome} onChange={setNome} required />
      <Select
        label="Tipo"
        value={tipo}
        onChange={(v) => setTipo(v as TipoPeca)}
        opcoes={[
          { value: TipoPeca.NACIONAL, label: 'Nacional' },
          { value: TipoPeca.IMPORTADA, label: 'Importada' },
        ]}
      />
      <Input
        label="Fornecedor"
        value={fornecedor}
        onChange={setFornecedor}
        required
      />
    </FormShell>
  )
}

function FormAtualizarStatusPeca({
  statusAtual,
  onSalvar,
  onCancelar,
}: {
  statusAtual: StatusPeca
  onSalvar: (status: StatusPeca) => void
  onCancelar: () => void
}) {
  const [status, setStatus] = useState<StatusPeca>(statusAtual)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSalvar(status)
  }

  return (
    <FormShell onSubmit={handleSubmit} onCancelar={onCancelar}>
      <Select
        label="Novo status"
        value={status}
        onChange={(v) => setStatus(v as StatusPeca)}
        opcoes={[
          { value: StatusPeca.EM_PRODUCAO, label: 'Em produção' },
          { value: StatusPeca.EM_TRANSPORTE, label: 'Em transporte' },
          { value: StatusPeca.PRONTA, label: 'Pronta' },
        ]}
      />
    </FormShell>
  )
}

function FormAdicionarEtapa({
  onSalvar,
  onCancelar,
}: {
  onSalvar: (etapa: {
    nome: string
    prazo: string
    status: StatusEtapa
    funcionarios: Funcionario[]
  }) => void
  onCancelar: () => void
}) {
  const [nome, setNome] = useState('')
  const [prazo, setPrazo] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSalvar({
      nome,
      prazo,
      status: StatusEtapa.PENDENTE,
      funcionarios: [],
    })
  }

  return (
    <FormShell onSubmit={handleSubmit} onCancelar={onCancelar}>
      <Input label="Nome" value={nome} onChange={setNome} required />
      <Input label="Prazo" value={prazo} onChange={setPrazo} required />
    </FormShell>
  )
}

function FormAssociarFuncionario({
  funcionarios,
  onSalvar,
  onCancelar,
}: {
  funcionarios: Funcionario[]
  onSalvar: (funcionarioId: string) => void
  onCancelar: () => void
}) {
  const [id, setId] = useState(funcionarios[0]?.id ?? '')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id) return
    onSalvar(id)
  }

  if (funcionarios.length === 0) {
    return (
      <div>
        <p className="text-sm text-slate-400 mb-4">
          Nenhum funcionário cadastrado.
        </p>
        <div className="flex justify-end">
          <Botao variante="secundario" onClick={onCancelar}>
            Fechar
          </Botao>
        </div>
      </div>
    )
  }

  return (
    <FormShell onSubmit={handleSubmit} onCancelar={onCancelar}>
      <Select
        label="Funcionário"
        value={id}
        onChange={setId}
        opcoes={funcionarios.map((f) => ({
          value: f.id,
          label: `${f.nome} [${f.nivelPermissao}]`,
        }))}
      />
    </FormShell>
  )
}

function FormAdicionarTeste({
  onSalvar,
  onCancelar,
}: {
  onSalvar: (teste: {
    tipo: TipoTeste
    descricao: string
    resultado: ResultadoTeste
  }) => void
  onCancelar: () => void
}) {
  const [tipo, setTipo] = useState<TipoTeste>(TipoTeste.ELETRICO)
  const [descricao, setDescricao] = useState('')
  const [resultado, setResultado] = useState<ResultadoTeste>(
    ResultadoTeste.APROVADO
  )

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSalvar({ tipo, descricao, resultado })
  }

  return (
  <FormShell onSubmit={handleSubmit} onCancelar={onCancelar}>
    <Select
      label="Tipo"
      value={tipo}
      onChange={(v) => setTipo(v as TipoTeste)}
      opcoes={[
        { value: TipoTeste.ELETRICO, label: 'Elétrico' },
        { value: TipoTeste.HIDRAULICO, label: 'Hidráulico' },
        { value: TipoTeste.AERODINAMICO, label: 'Aerodinâmico' },
      ]}
    />

    <div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-slate-300">
    Descrição
  </label>

  <textarea
    value={descricao}
    onChange={(e) => setDescricao(e.target.value)}
    required
    rows={4}
    placeholder="Descreva o objetivo, área testada ou observações..."
    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
  />
</div>

    <Select
      label="Resultado"
      value={resultado}
      onChange={(v) => setResultado(v as ResultadoTeste)}
      opcoes={[
        { value: ResultadoTeste.APROVADO, label: 'Aprovado' },
        { value: ResultadoTeste.REPROVADO, label: 'Reprovado' },
      ]}
    />
  </FormShell>
)
}

function FormShell({
  onSubmit,
  onCancelar,
  children,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onCancelar: () => void
  children: ReactNode
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {children}
      <div className="flex justify-end gap-2 mt-2">
        <Botao variante="secundario" onClick={onCancelar}>
          Cancelar
        </Botao>
        <Botao type="submit">Salvar</Botao>
      </div>
    </form>
  )
}

function montarRelatorio(a: Aeronave): string {
  const linhas: string[] = []
  linhas.push('===== RELATÓRIO FINAL =====')
  linhas.push(`Código: ${a.codigo}`)
  linhas.push(`Modelo: ${a.modelo}`)
  linhas.push(`Tipo: ${a.tipo}`)
  linhas.push(`Capacidade: ${a.capacidade} passageiros`)
  linhas.push(`Alcance: ${a.alcance} km`)
  linhas.push('')

  linhas.push(`--- Peças (${a.pecas.length}) ---`)
  a.pecas.forEach((p, i) => {
    linhas.push(
      `${i + 1}. ${p.nome} | ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`
    )
  })
  linhas.push('')

  linhas.push(`--- Etapas (${a.etapas.length}) ---`)
  a.etapas.forEach((e, i) => {
    linhas.push(`${i + 1}. ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status}`)
    if (e.funcionarios.length > 0) {
      linhas.push(
        `   Funcionários: ${e.funcionarios.map((f) => f.nome).join(', ')}`
      )
    }
  })
  linhas.push('')

  linhas.push(`--- Testes (${a.testes.length}) ---`)
  a.testes.forEach((t, i) => {
    linhas.push(`${i + 1}. ${t.tipo} → ${t.resultado}`)
  })

  return linhas.join('\n')
}
