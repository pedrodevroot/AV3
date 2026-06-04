import { StatusOrdem, PrioridadeOrdem } from '@prisma/client';
import prisma from './prisma';

const includeOrdem = {
  aeronave: { select: { id: true, codigo: true, modelo: true, tipo: true } },
  responsavel: { select: { id: true, nome: true, usuario: true, nivelPermissao: true } },
  itens: {
    include: {
      peca: { select: { id: true, nome: true, tipo: true, fornecedor: true, status: true } },
    },
  },
};

export interface CreateOrdemData {
  codigo: string;
  descricao: string;
  prioridade: PrioridadeOrdem;
  aeronaveId: string;
  responsavelId: string;
}

export interface UpdateOrdemData {
  descricao?: string;
  prioridade?: PrioridadeOrdem;
  status?: StatusOrdem;
  dataFechamento?: Date | null;
}

export interface AddPecaData {
  ordemId: string;
  pecaId: string;
  quantidade: number;
}

export const ordemRepository = {
  findAll(filters?: { status?: StatusOrdem; prioridade?: PrioridadeOrdem }) {
    return prisma.ordemFabricacao.findMany({
      where: {
        status: filters?.status,
        prioridade: filters?.prioridade,
      },
      orderBy: [{ prioridade: 'desc' }, { dataAbertura: 'desc' }],
      include: includeOrdem,
    });
  },

  findById(id: string) {
    return prisma.ordemFabricacao.findUnique({
      where: { id },
      include: includeOrdem,
    });
  },

  findByCodigo(codigo: string) {
    return prisma.ordemFabricacao.findUnique({
      where: { codigo },
      include: includeOrdem,
    });
  },

  create(data: CreateOrdemData) {
    return prisma.ordemFabricacao.create({ data, include: includeOrdem });
  },

  update(id: string, data: UpdateOrdemData) {
    return prisma.ordemFabricacao.update({
      where: { id },
      data,
      include: includeOrdem,
    });
  },

  delete(id: string) {
    return prisma.ordemFabricacao.delete({ where: { id } });
  },

  addPeca(data: AddPecaData) {
    return prisma.ordemPeca.create({
      data,
      include: {
        peca: { select: { id: true, nome: true, tipo: true, fornecedor: true, status: true } },
      },
    });
  },

  updateQuantidadePeca(ordemId: string, pecaId: string, quantidade: number) {
    return prisma.ordemPeca.update({
      where: { ordemId_pecaId: { ordemId, pecaId } },
      data: { quantidade },
      include: {
        peca: { select: { id: true, nome: true, tipo: true, fornecedor: true, status: true } },
      },
    });
  },

  removePeca(ordemId: string, pecaId: string) {
    return prisma.ordemPeca.delete({
      where: { ordemId_pecaId: { ordemId, pecaId } },
    });
  },

  findOrdemPeca(ordemId: string, pecaId: string) {
    return prisma.ordemPeca.findUnique({
      where: { ordemId_pecaId: { ordemId, pecaId } },
    });
  },
};
