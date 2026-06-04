import { z } from 'zod';

export const createRelatorioSchema = z.object({
  cliente: z.string().min(2, 'Nome do cliente deve ter ao menos 2 caracteres'),
  dataEntrega: z.string().datetime({ message: 'Data de entrega deve ser uma data ISO 8601 válida' }),
});
