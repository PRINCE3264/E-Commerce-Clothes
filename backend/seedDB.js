const { execSync } = require('child_process');
const path = require('path');

// ─── MongoDB Database Seeder ────────────────────────────────
// Restores the full PanditFashion database from the backup dump.
// Usage:  cd backend && npm run seed
// ─────────────────────────────────────────────────────────────

const backupDir = path.join(__dirname, '..', 'backup', 'PanditFashion');
const dbName = 'PanditFashion';

console.log('\n🌱  Seeding database...');
console.log(`📂  Restoring from: ${backupDir}`);
console.log(`🗄️   Target DB:      ${dbName}\n`);

try {
    execSync(
        `mongorestore --db ${dbName} --drop "${backupDir}"`,
        { stdio: 'inherit' }
    );

    console.log('\n✅  Database seeded successfully!\n');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║            🔑  TEST CREDENTIALS                 ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║  Role   │  Email              │  Password       ║');
    console.log('╠═════════╪═════════════════════╪═════════════════╣');
    console.log('║  Admin  │  admin@gmail.com     │  admin123      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('\n🚀  Start the server:  npm run dev\n');
} catch (err) {
    console.error('\n❌  Seed failed! Make sure:');
    console.error('   1. MongoDB is running locally (mongod)');
    console.error('   2. mongorestore is installed (MongoDB Database Tools)');
    console.error('   3. The backup/ folder exists at the project root\n');
    process.exit(1);
}
