import { TipoTeste, ResultadoTeste } from '@prisma/client';
import prisma from './prisma';

export interface CreateTesteData {
  aeronaveId: string;
  tipo: TipoTeste;
  resultado: ResultadoTeste;
}

export const testeRepository = {
  findAllByAeronave(aeronaveId: string) {
    return prisma.teste.findMany({
      where: { aeronaveId },
      orderBy: { criadoEm: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.teste.findUnique({ where: { id } });
  },

  create(data: CreateTesteData) {
    return prisma.teste.create({ data });
  },

  delete(id: string) {
    return prisma.teste.delete({ where: { id } });
  },
};
