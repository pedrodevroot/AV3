import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissao } from '../../hooks/usePermissao'
import { useDados } from '../../contexts/DadosContext'
import { TipoAeronave, StatusEtapa } from '../../types'
import type { Aeronave } from '../../types'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import Botao from '../../components/Botao'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Badge from '../../components/Badge'
import { PlaneIcon, PlusIcon } from '../../components/Icons'

export default function GerenciarAeronaves() {
  const { podeAdministrar } = usePermissao()
  const { aeronaves, adicionarAeronave } = useDados()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)

  const subtitulo =
    aeronaves.length === 0
      ? 'Nenhuma aeronave na frota'
      : aeronaves.length === 1
      ? '1 aeronave cadastrada'
      : `${aeronaves.length} aeronaves cadastradas`

  return (
    <Layout
      titulo="Aeronaves"
      subtitulo={subtitulo}
      acoes={
        podeAdministrar && (
          <Botao
            iconeEsquerda={<PlusIcon className="w-4 h-4" />}
            onClick={() => setModalAberto(true)}
          >
            Cadastrar Aeronave
          </Botao>
        )
      }
    >
      {aeronaves.length === 0 ? (
        <EstadoVazio />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aeronaves.map((a) => (
            <CardAeronave
              key={a.codigo}
              aeronave={a}
              onClick={() => navigate(`/aeronaves/${a.codigo}`)}
            />
          ))}
        </div>
      )}

      {modalAberto && (
        <ModalCadastro
          aeronaves={aeronaves}
          onSalvar={adicionarAeronave}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </Layout>
  )
}

function CardAeronave({
  aeronave,
  onClick,
}: {
  aeronave: Aeronave
  onClick: () => void
}) {
  const total = aeronave.etapas.length
  const concluidas = aeronave.etapas.filter(
    (e) => e.status === StatusEtapa.CONCLUIDA
  ).length
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0

  return (
    <Card
      hoverable
      className="p-5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/5 transition-colors shrink-0">
            <PlaneIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-slate-100 truncate">
              {aeronave.modelo}
            </h3>
            <p className="text-xs text-slate-500 font-mono">{aeronave.codigo}</p>
          </div>
        </div>
        <Badge tom={aeronave.tipo === TipoAeronave.COMERCIAL ? 'info' : 'aviso'}>
          {aeronave.tipo}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-800">
        <Stat label="Capacidade" value={`${aeronave.capacidade} pax`} />
        <Stat label="Alcance" value={`${aeronave.alcance} km`} />
      </div>

      {total > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Progresso da produção</span>
            <span className="text-slate-300 font-medium">
              {concluidas}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Nenhuma etapa cadastrada</p>
      )}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </p>
      <p className="text-sm text-slate-200 font-medium mt-0.5">{value}</p>
    </div>
  )
}

function EstadoVazio() {
  return (
    <Card className="p-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <PlaneIcon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-medium text-slate-200 mb-1">
        Nenhuma aeronave cadastrada
      </h3>
      <p className="text-sm text-slate-500">
        Comece cadastrando uma nova aeronave na frota.
      </p>
    </Card>
  )
}

function ModalCadastro({
  aeronaves,
  onSalvar,
  onFechar,
}: {
  aeronaves: Aeronave[]
  onSalvar: (a: Aeronave) => void
  onFechar: () => void
}) {
  const [codigo, setCodigo] = useState('')
  const [modelo, setModelo] = useState('')
  const [tipo, setTipo] = useState<TipoAeronave>(TipoAeronave.COMERCIAL)
  const [capacidade, setCapacidade] = useState('')
  const [alcance, setAlcance] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const capNum = parseInt(capacidade, 10)
    const alcNum = parseInt(alcance, 10)

    if (aeronaves.some((a) => a.codigo === codigo)) {
      setErro('Já existe uma aeronave com esse código.')
      return
    }

    if (isNaN(capNum) || capNum <= 0) {
      setErro('Capacidade deve ser um número inteiro positivo.')
      return
    }

    if (isNaN(alcNum) || alcNum <= 0) {
      setErro('Alcance deve ser um número inteiro positivo.')
      return
    }

    onSalvar({
      codigo,
      modelo,
      tipo,
      capacidade: capNum,
      alcance: alcNum,
      pecas: [],
      etapas: [],
      testes: [],
    })
    onFechar()
  }

  return (
    <Modal onFechar={onFechar} titulo="Cadastrar aeronave">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Código" value={codigo} onChange={setCodigo} required />
        <Input label="Modelo" value={modelo} onChange={setModelo} required />
        <Select
          label="Tipo"
          value={tipo}
          onChange={(v) => setTipo(v as TipoAeronave)}
          opcoes={[
            { value: TipoAeronave.COMERCIAL, label: 'Comercial' },
            { value: TipoAeronave.MILITAR, label: 'Militar' },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Capacidade"
            type="number"
            min="1"
            value={capacidade}
            onChange={setCapacidade}
            required
          />
          <Input
            label="Alcance (km)"
            type="number"
            min="1"
            value={alcance}
            onChange={setAlcance}
            required
          />
        </div>

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
