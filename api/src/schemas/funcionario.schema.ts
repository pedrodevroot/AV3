import { z } from 'zod';
import { NivelPermissao } from '@prisma/client';

export const createFuncionarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  telefone: z.string().min(8, 'Telefone inválido'),
  endereco: z.string().min(5, 'Endereço inválido'),
  usuario: z
    .string()
    .min(3, 'Usuário deve ter ao menos 3 caracteres')
    .regex(/^\S+$/, 'Usuário não pode conter espaços'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  nivelPermissao: z.nativeEnum(NivelPermissao),
});

export const updateFuncionarioSchema = z
  .object({
    nome: z.string().min(2).optional(),
    telefone: z.string().min(8).optional(),
    endereco: z.string().min(5).optional(),
    usuario: z
      .string()
      .min(3)
      .regex(/^\S+$/, 'Usuário não pode conter espaços')
      .optional(),
    senha: z.string().min(6).optional(),
    nivelPermissao: z.nativeEnum(NivelPermissao).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  });
