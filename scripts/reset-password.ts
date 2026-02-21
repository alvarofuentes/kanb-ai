/**
 * Script para cambiar la contraseña de un usuario
 * Uso: bun run scripts/reset-password.ts
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('\n🔐 Cambio de Contraseña - Kan-B AI\n');

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  if (users.length === 0) {
    console.log('❌ No hay usuarios registrados.\n');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  console.log('Usuarios registrados:');
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} (${user.name || 'Sin nombre'})`);
  });
  console.log('');

  const email = await question('📧 Ingresa el email del usuario: ');
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ Usuario no encontrado.\n');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  const newPassword = await question('🔑 Ingresa la nueva contraseña: ');
  
  if (newPassword.length < 4) {
    console.log('❌ La contraseña debe tener al menos 4 caracteres.\n');
    rl.close();
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`\n✅ Contraseña actualizada para ${email}\n`);

  rl.close();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
