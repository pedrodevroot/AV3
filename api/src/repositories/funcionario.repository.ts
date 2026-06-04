import { NivelPermissao } from '@prisma/client';
import prisma from './prisma';

const publicFields = {
  id: true,
  nome: true,
  telefone: true,
  endereco: true,
  usuario: true,
  nivelPermissao: true,
  criadoEm: true,
  atualizadoEm: true,
};

export interface CreateFuncionarioData {
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senhaHash: string;
  nivelPermissao: NivelPermissao;
}

export interface UpdateFuncionarioData {
  nome?: string;
  telefone?: string;
  endereco?: string;
  usuario?: string;
  senhaHash?: string;
  nivelPermissao?: NivelPermissao;
}

export const funcionarioRepository = {
  findAll() {
    return prisma.funcionario.findMany({
      orderBy: { nome: 'asc' },
      select: publicFields,
    });
  },

  findById(id: string) {
    return prisma.funcionario.findUnique({
      where: { id },
      select: publicFields,
    });
  },

  findByUsuario(usuario: string) {
    return prisma.funcionario.findUnique({ where: { usuario } });
  },

  create(data: CreateFuncionarioData) {
    return prisma.funcionario.create({
      data,
      select: publicFields,
    });
  },

  update(id: string, data: UpdateFuncionarioData) {
    return prisma.funcionario.update({
      where: { id },
      data,
      select: publicFields,
    });
  },

  delete(id: string) {
    return prisma.funcionario.delete({ where: { id } });
  },

  exists(id: string) {
    return prisma.funcionario.findUnique({ where: { id }, select: { id: true } });
  },
};
