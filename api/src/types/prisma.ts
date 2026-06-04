import { Prisma } from '@prisma/client';

// ─── Tipos de payload completo das entidades ────────────────────────────────

export type FuncionarioPublico = Prisma.FuncionarioGetPayload<{
  select: {
    id: true;
    nome: true;
    telefone: true;
    endereco: true;
    usuario: true;
    nivelPermissao: true;
    criadoEm: true;
    atualizadoEm: true;
  };
}>;

export type AeronaveCompleta = Prisma.AeronaveGetPayload<{
  include: {
    pecas: true;
    etapas: {
      include: {
        funcionarios: {
          include: {
            funcionario: {
              select: { id: true; nome: true; usuario: true; nivelPermissao: true };
            };
          };
        };
      };
    };
    testes: true;
  };
}>;

export type EtapaComFuncionarios = Prisma.EtapaGetPayload<{
  include: {
    funcionarios: {
      include: {
        funcionario: {
          select: { id: true; nome: true; usuario: true; nivelPermissao: true };
        };
      };
    };
  };
}>;

export type OrdemCompleta = Prisma.OrdemFabricacaoGetPayload<{
  include: {
    aeronave: { select: { id: true; codigo: true; modelo: true; tipo: true } };
    responsavel: { select: { id: true; nome: true; usuario: true; nivelPermissao: true } };
    itens: {
      include: {
        peca: { select: { id: true; nome: true; tipo: true; fornecedor: true; status: true } };
      };
    };
  };
}>;

// ─── Tipos de input (inferidos dos schemas Zod via Prisma) ──────────────────

export type CreateFuncionarioInput = Omit<
  Prisma.FuncionarioCreateInput,
  'etapas' | 'ordensResponsavel'
>;

export type CreateAeronaveInput = Omit<
  Prisma.AeronaveCreateInput,
  'pecas' | 'etapas' | 'testes' | 'relatorios' | 'ordens'
>;
