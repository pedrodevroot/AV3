import { PrismaClient, NivelPermissao } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.funcionario.upsert({
    where: { usuario: 'admin' },
    update: {},
    create: {
      nome: 'Administrador',
      telefone: '(11) 99999-0000',
      endereco: 'Rua Principal, 1 — São Paulo/SP',
      usuario: 'admin',
      senhaHash,
      nivelPermissao: NivelPermissao.ADMINISTRADOR,
    },
  });

  console.log('Seed concluído:', { admin: admin.usuario });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
