import bcrypt from 'bcrypt';
import { NivelPermissao } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { funcionarioRepository } from '../repositories/funcionario.repository';

interface CreateInput {
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha: string;
  nivelPermissao: NivelPermissao;
}

interface UpdateInput {
  nome?: string;
  telefone?: string;
  endereco?: string;
  usuario?: string;
  senha?: string;
  nivelPermissao?: NivelPermissao;
}

export const funcionarioService = {
  async listar() {
    return funcionarioRepository.findAll();
  },

  async buscarPorId(id: string) {
    const funcionario = await funcionarioRepository.findById(id);
    if (!funcionario) throw new AppError('Funcionário não encontrado', 404);
    return funcionario;
  },

  async criar(data: CreateInput) {
    const existente = await funcionarioRepository.findByUsuario(data.usuario);
    if (existente) throw new AppError('Nome de usuário já está em uso', 409);

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return funcionarioRepository.create({
      nome: data.nome,
      telefone: data.telefone,
      endereco: data.endereco,
      usuario: data.usuario,
      senhaHash,
      nivelPermissao: data.nivelPermissao,
    });
  },

  async atualizar(id: string, data: UpdateInput) {
    const funcionario = await funcionarioRepository.findById(id);
    if (!funcionario) throw new AppError('Funcionário não encontrado', 404);

    if (data.usuario) {
      const existente = await funcionarioRepository.findByUsuario(data.usuario);
      if (existente && existente.id !== id) {
        throw new AppError('Nome de usuário já está em uso', 409);
      }
    }

    const updateData: Parameters<typeof funcionarioRepository.update>[1] = {
      nome: data.nome,
      telefone: data.telefone,
      endereco: data.endereco,
      usuario: data.usuario,
      nivelPermissao: data.nivelPermissao,
    };

    if (data.senha) {
      updateData.senhaHash = await bcrypt.hash(data.senha, 10);
    }

    return funcionarioRepository.update(id, updateData);
  },

  async remover(id: string) {
    const funcionario = await funcionarioRepository.findById(id);
    if (!funcionario) throw new AppError('Funcionário não encontrado', 404);
    await funcionarioRepository.delete(id);
  },
};
