import { z } from 'zod';

export const createEtapaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  prazo: z.string().datetime({ message: 'Prazo deve ser uma data ISO 8601 válida' }),
});

export const updateEtapaSchema = z
  .object({
    nome: z.string().min(2).optional(),
    prazo: z.string().datetime().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado para atualização',
  });

export const associarFuncionarioSchema = z.object({
  funcionarioId: z.string().min(1, 'ID do funcionário é obrigatório'),
});
