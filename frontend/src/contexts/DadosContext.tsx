import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  Aeronave,
  Funcionario,
  Peca,
  Etapa,
  Teste,
} from "../types";
import { NivelPermissao, StatusEtapa, StatusPeca } from "../types";
import { Armazenamento } from "../services/Armazenamento";

interface DadosContextValue {
  aeronaves: Aeronave[];
  funcionarios: Funcionario[];

  adicionarAeronave: (aeronave: Aeronave) => void;
  adicionarFuncionario: (funcionario: Funcionario) => void;

  adicionarPeca: (codigoAeronave: string, peca: Peca) => void;
  adicionarEtapa: (codigoAeronave: string, etapa: Etapa) => void;
  adicionarTeste: (codigoAeronave: string, teste: Teste) => void;

  iniciarEtapa: (codigoAeronave: string, indiceEtapa: number) => boolean;
  finalizarEtapa: (codigoAeronave: string, indiceEtapa: number) => boolean;

  atualizarStatusPeca: (
    codigoAeronave: string,
    indicePeca: number,
    novoStatus: StatusPeca
  ) => void;

  associarFuncionarioEtapa: (
    codigoAeronave: string,
    indiceEtapa: number,
    funcionarioId: string
  ) => void;
}

const DadosContext = createContext<DadosContextValue | null>(null);

const CHAVE_AERONAVES = "aeronaves";
const CHAVE_FUNCIONARIOS = "funcionarios";

const ADMIN_PADRAO: Funcionario = {
  id: "1",
  nome: "Administrador",
  telefone: "00000000000",
  endereco: "Sede Aerocode",
  usuario: "admin",
  senha: "admin123",
  nivelPermissao: NivelPermissao.ADMINISTRADOR,
};

export function DadosProvider({ children }: { children: ReactNode }) {
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setAeronaves(Armazenamento.carregar<Aeronave[]>(CHAVE_AERONAVES) ?? []);

    const carregados =
      Armazenamento.carregar<Funcionario[]>(CHAVE_FUNCIONARIOS) ?? [];
    if (carregados.length === 0) carregados.push(ADMIN_PADRAO);
    setFuncionarios(carregados);

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    Armazenamento.salvar(CHAVE_AERONAVES, aeronaves);
  }, [aeronaves, carregado]);

  useEffect(() => {
    if (!carregado) return;
    Armazenamento.salvar(CHAVE_FUNCIONARIOS, funcionarios);
  }, [funcionarios, carregado]);

  function adicionarAeronave(aeronave: Aeronave): void {
    setAeronaves((prev) => [...prev, aeronave]);
  }

  function adicionarFuncionario(funcionario: Funcionario): void {
    setFuncionarios((prev) => [...prev, funcionario]);
  }

  function adicionarPeca(codigoAeronave: string, peca: Peca): void {
    setAeronaves((prev) =>
      prev.map((a) =>
        a.codigo === codigoAeronave
          ? { ...a, pecas: [...a.pecas, peca] }
          : a
      )
    );
  }

  function adicionarEtapa(codigoAeronave: string, etapa: Etapa): void {
    setAeronaves((prev) =>
      prev.map((a) =>
        a.codigo === codigoAeronave
          ? { ...a, etapas: [...a.etapas, etapa] }
          : a
      )
    );
  }

  function adicionarTeste(codigoAeronave: string, teste: Teste): void {
    setAeronaves((prev) =>
      prev.map((a) =>
        a.codigo === codigoAeronave
          ? { ...a, testes: [...a.testes, teste] }
          : a
      )
    );
  }

  function iniciarEtapa(
    codigoAeronave: string,
    indiceEtapa: number
  ): boolean {
    const a = aeronaves.find((x) => x.codigo === codigoAeronave);
    if (!a || indiceEtapa < 0 || indiceEtapa >= a.etapas.length) return false;

    setAeronaves((prev) =>
      prev.map((aer) => {
        if (aer.codigo !== codigoAeronave) return aer;
        if (indiceEtapa < 0 || indiceEtapa >= aer.etapas.length) return aer;
        return {
          ...aer,
          etapas: aer.etapas.map((e, i) =>
            i === indiceEtapa ? { ...e, status: StatusEtapa.ANDAMENTO } : e
          ),
        };
      })
    );
    return true;
  }

  function finalizarEtapa(
    codigoAeronave: string,
    indiceEtapa: number
  ): boolean {
    const a = aeronaves.find((x) => x.codigo === codigoAeronave);
    if (!a || indiceEtapa < 0 || indiceEtapa >= a.etapas.length) return false;
    if (
      indiceEtapa > 0 &&
      a.etapas[indiceEtapa - 1]!.status !== StatusEtapa.CONCLUIDA
    ) {
      return false;
    }

    setAeronaves((prev) =>
      prev.map((aer) => {
        if (aer.codigo !== codigoAeronave) return aer;
        if (indiceEtapa < 0 || indiceEtapa >= aer.etapas.length) return aer;
        if (
          indiceEtapa > 0 &&
          aer.etapas[indiceEtapa - 1]!.status !== StatusEtapa.CONCLUIDA
        ) {
          return aer;
        }
        return {
          ...aer,
          etapas: aer.etapas.map((e, i) =>
            i === indiceEtapa ? { ...e, status: StatusEtapa.CONCLUIDA } : e
          ),
        };
      })
    );
    return true;
  }

  function atualizarStatusPeca(
    codigoAeronave: string,
    indicePeca: number,
    novoStatus: StatusPeca
  ): void {
    setAeronaves((prev) =>
      prev.map((a) =>
        a.codigo === codigoAeronave
          ? {
              ...a,
              pecas: a.pecas.map((p, i) =>
                i === indicePeca ? { ...p, status: novoStatus } : p
              ),
            }
          : a
      )
    );
  }

  function associarFuncionarioEtapa(
    codigoAeronave: string,
    indiceEtapa: number,
    funcionarioId: string
  ): void {
    const funcionario = funcionarios.find((f) => f.id === funcionarioId);
    if (!funcionario) return;

    setAeronaves((prev) =>
      prev.map((a) =>
        a.codigo === codigoAeronave
          ? {
              ...a,
              etapas: a.etapas.map((e, i) =>
                i === indiceEtapa
                  ? {
                      ...e,
                      funcionarios: [...e.funcionarios, funcionario],
                    }
                  : e
              ),
            }
          : a
      )
    );
  }

  return (
    <DadosContext.Provider
      value={{
        aeronaves,
        funcionarios,
        adicionarAeronave,
        adicionarFuncionario,
        adicionarPeca,
        adicionarEtapa,
        adicionarTeste,
        iniciarEtapa,
        finalizarEtapa,
        atualizarStatusPeca,
        associarFuncionarioEtapa,
      }}
    >
      {children}
    </DadosContext.Provider>
  );
}

export function useDados(): DadosContextValue {
  const ctx = useContext(DadosContext);
  if (!ctx) {
    throw new Error("useDados deve ser usado dentro de <DadosProvider>");
  }
  return ctx;
}
