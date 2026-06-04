import { z } from 'zod';
import { StatusOrdem, PrioridadeOrdem } from '@prisma/client';

export const createOrdemSchema = z.object({
  codigo: z
    .string()
    .min(2, 'Código deve ter ao menos 2 caracteres')
    .regex(/^\S+$/, 'Código não pode conter espaços'),
  descricao: z.string().min(5, 'Descrição deve ter ao menos 5 caracteres'),
  prioridade: z.nativeEnum(PrioridadeOrdem).default(PrioridadeOrdem.MEDIA),
  aeronaveId: z.string().min(1, 'ID da aeronave é obrigatório'),
});

export const updateOrdemSchema = z
  .object({
    descricao: z.string().min(5).optional(),
    prioridade: z.nativeEnum(PrioridadeOrdem).optional(),
    status: z.nativeEnum(StatusOrdem).optional(),
    dataFechamento: z.string().datetime().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  });

export const addPecaOrdemSchema = z.object({
  pecaId: z.string().min(1, 'ID da peça é obrigatório'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva').default(1),
});

export const updateQuantidadePecaSchema = z.object({
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
});

export const ordemQuerySchema = z.object({
  status: z.nativeEnum(StatusOrdem).optional(),
  prioridade: z.nativeEnum(PrioridadeOrdem).optional(),
});
