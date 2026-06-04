import { TipoAeronave } from '@prisma/client';
import prisma from './prisma';

const includeCompleto = {
  pecas: true,
  etapas: {
    include: {
      funcionarios: {
        include: {
          funcionario: {
            select: { id: true, nome: true, usuario: true, nivelPermissao: true },
          },
        },
      },
    },
  },
  testes: true,
};

export interface CreateAeronaveData {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
}

export interface UpdateAeronaveData {
  modelo?: string;
  tipo?: TipoAeronave;
  capacidade?: number;
  alcance?: number;
}

export const aeronaveRepository = {
  findAll() {
    return prisma.aeronave.findMany({
      orderBy: { criadoEm: 'desc' },
      include: includeCompleto,
    });
  },

  findByCodigo(codigo: string) {
    return prisma.aeronave.findUnique({
      where: { codigo },
      include: includeCompleto,
    });
  },

  create(data: CreateAeronaveData) {
    return prisma.aeronave.create({ data, include: includeCompleto });
  },

  update(codigo: string, data: UpdateAeronaveData) {
    return prisma.aeronave.update({
      where: { codigo },
      data,
      include: includeCompleto,
    });
  },

  delete(codigo: string) {
    return prisma.aeronave.delete({ where: { codigo } });
  },
};
