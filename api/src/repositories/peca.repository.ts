import { StatusPeca, TipoPeca } from '@prisma/client';
import prisma from './prisma';

export interface CreatePecaData {
  aeronaveId: string;
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;
}

export interface UpdatePecaData {
  nome?: string;
  tipo?: TipoPeca;
  fornecedor?: string;
  status?: StatusPeca;
}

export const pecaRepository = {
  findAllByAeronave(aeronaveId: string) {
    return prisma.peca.findMany({
      where: { aeronaveId },
      orderBy: { criadoEm: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.peca.findUnique({ where: { id } });
  },

  create(data: CreatePecaData) {
    return prisma.peca.create({ data });
  },

  update(id: string, data: UpdatePecaData) {
    return prisma.peca.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.peca.delete({ where: { id } });
  },
};
