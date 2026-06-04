import { StatusEtapa } from '@prisma/client';
import prisma from './prisma';

const includeEtapa = {
  funcionarios: {
    include: {
      funcionario: {
        select: { id: true, nome: true, usuario: true, nivelPermissao: true },
      },
    },
  },
};

export interface CreateEtapaData {
  aeronaveId: string;
  nome: string;
  prazo: Date;
}

export interface UpdateEtapaData {
  nome?: string;
  prazo?: Date;
}

export const etapaRepository = {
  findAllByAeronave(aeronaveId: string) {
    return prisma.etapa.findMany({
      where: { aeronaveId },
      orderBy: { criadoEm: 'asc' },
      include: includeEtapa,
    });
  },

  findById(id: string) {
    return prisma.etapa.findUnique({
      where: { id },
      include: includeEtapa,
    });
  },

  create(data: CreateEtapaData) {
    return prisma.etapa.create({ data, include: includeEtapa });
  },

  updateStatus(id: string, status: StatusEtapa) {
    return prisma.etapa.update({
      where: { id },
      data: { status },
      include: includeEtapa,
    });
  },

  update(id: string, data: UpdateEtapaData) {
    return prisma.etapa.update({
      where: { id },
      data,
      include: includeEtapa,
    });
  },

  associarFuncionario(etapaId: string, funcionarioId: string) {
    return prisma.etapaFuncionario.create({ data: { etapaId, funcionarioId } });
  },

  desassociarFuncionario(etapaId: string, funcionarioId: string) {
    return prisma.etapaFuncionario.delete({
      where: { etapaId_funcionarioId: { etapaId, funcionarioId } },
    });
  },

  funcionarioJaAssociado(etapaId: string, funcionarioId: string) {
    return prisma.etapaFuncionario.findUnique({
      where: { etapaId_funcionarioId: { etapaId, funcionarioId } },
    });
  },

  delete(id: string) {
    return prisma.etapa.delete({ where: { id } });
  },
};
