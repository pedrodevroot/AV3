import { z } from 'zod';
import { TipoTeste, ResultadoTeste } from '@prisma/client';

export const createTesteSchema = z.object({
  tipo: z.nativeEnum(TipoTeste),
  resultado: z.nativeEnum(ResultadoTeste),
});
