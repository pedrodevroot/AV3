import { z } from 'zod';
import { TipoAeronave } from '@prisma/client';

export const createAeronaveSchema = z.object({
  codigo: z
    .string()
    .min(2, 'Código deve ter ao menos 2 caracteres')
    .regex(/^\S+$/, 'Código não pode conter espaços'),
  modelo: z.string().min(2, 'Modelo deve ter ao menos 2 caracteres'),
  tipo: z.nativeEnum(TipoAeronave),
  capacidade: z.number().int().positive('Capacidade deve ser um número positivo'),
  alcance: z.number().positive('Alcance deve ser um número positivo'),
});

export const updateAeronaveSchema = z
  .object({
    modelo: z.string().min(2).optional(),
    tipo: z.nativeEnum(TipoAeronave).optional(),
    capacidade: z.number().int().positive().optional(),
    alcance: z.number().positive().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  });

export const codigoParamSchema = z.object({
  codigo: z.string().min(1),
});
