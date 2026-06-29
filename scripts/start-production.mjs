import { execSync } from 'node:child_process';

function run(command: string) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: 'inherit', env: process.env });
}

function setupDatabase() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('DATABASE_URL is not set. Add it in EasyPanel → App → Environment.');
    process.exit(1);
  }

  try {
    run('npx prisma db push --skip-generate');
    run('npx tsx prisma/seed.ts');
    console.log('\nDatabase ready.\n');
  } catch (error) {
    console.error('\nDatabase setup failed. Check DATABASE_URL and Postgres service.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

setupDatabase();
run('npx next start');
