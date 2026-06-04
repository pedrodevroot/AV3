import prisma from './prisma';

export interface CreateRelatorioData {
  aeronaveId: string;
  cliente: string;
  dataEntrega: Date;
  conteudo: string;
}

export const relatorioRepository = {
  findAllByAeronave(aeronaveId: string) {
    return prisma.relatorio.findMany({
      where: { aeronaveId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        aeronaveId: true,
        cliente: true,
        dataEntrega: true,
        criadoEm: true,
      },
    });
  },

  findById(id: string) {
    return prisma.relatorio.findUnique({ where: { id } });
  },

  create(data: CreateRelatorioData) {
    return prisma.relatorio.create({ data });
  },
};
