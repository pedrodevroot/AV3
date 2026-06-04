import { z } from 'zod';
import { TipoPeca, StatusPeca } from '@prisma/client';

export const createPecaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  tipo: z.nativeEnum(TipoPeca),
  fornecedor: z.string().min(2, 'Fornecedor deve ter ao menos 2 caracteres'),
  status: z.nativeEnum(StatusPeca),
});

export const updatePecaSchema = z
  .object({
    nome: z.string().min(2).optional(),
    tipo: z.nativeEnum(TipoPeca).optional(),
    fornecedor: z.string().min(2).optional(),
    status: z.nativeEnum(StatusPeca).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  });

export const updateStatusPecaSchema = z.object({
  status: z.nativeEnum(StatusPeca),
});
