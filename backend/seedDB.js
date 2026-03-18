const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── MongoDB Database Seeder ────────────────────────────────
// Restores the full PanditFashion database from the backup dump
// AND sets up .env files for new developers.
// Usage:  cd backend && npm run seed
// ─────────────────────────────────────────────────────────────

const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = __dirname;

// ──────────────── Step 1: Create .env files if missing ──────────────
function setupEnvFiles() {
    console.log('\n📋  Setting up environment files...\n');

    // Backend .env
    const backendEnv = path.join(BACKEND_DIR, '.env');
    const backendEnvExample = path.join(BACKEND_DIR, '.env.example');
    if (!fs.existsSync(backendEnv) && fs.existsSync(backendEnvExample)) {
        fs.copyFileSync(backendEnvExample, backendEnv);
        console.log('   ✅  Created backend/.env from .env.example');
    } else if (fs.existsSync(backendEnv)) {
        console.log('   ✔️   backend/.env already exists (skipped)');
    }

    // Frontend .env
    const frontendEnv = path.join(ROOT_DIR, '.env');
    const frontendEnvExample = path.join(ROOT_DIR, '.env.example');
    if (!fs.existsSync(frontendEnv) && fs.existsSync(frontendEnvExample)) {
        fs.copyFileSync(frontendEnvExample, frontendEnv);
        console.log('   ✅  Created .env from .env.example (frontend)');
    } else if (fs.existsSync(frontendEnv)) {
        console.log('   ✔️   .env already exists for frontend (skipped)');
    }
}

// ──────────────── Step 2: Restore MongoDB dump ──────────────
function restoreDatabase() {
    const backupDir = path.join(ROOT_DIR, 'backup', 'PanditFashion');
    const dbName = 'PanditFashion';

    console.log('\n🌱  Seeding database...');
    console.log(`   📂  Restoring from: ${backupDir}`);
    console.log(`   🗄️   Target DB:      ${dbName}\n`);

    try {
        execSync(
            `mongorestore --db ${dbName} --drop "${backupDir}"`,
            { stdio: 'inherit' }
        );
        return true;
    } catch (err) {
        console.error('\n❌  Database restore failed! Make sure:');
        console.error('   1. MongoDB is running locally (mongod)');
        console.error('   2. mongorestore is installed (MongoDB Database Tools)');
        console.error('   3. The backup/ folder exists at the project root\n');
        return false;
    }
}

// ──────────────── Run Everything ─────────────────────────────
setupEnvFiles();
const success = restoreDatabase();

if (success) {
    console.log('\n✅  Setup complete! Everything is ready.\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║              🔑  TEST CREDENTIALS                          ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Role    │  Email               │  Password                ║');
    console.log('╠══════════╪══════════════════════╪══════════════════════════╣');
    console.log('║  Admin   │  admin@gmail.com      │  admin123               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📦  Collections restored:');
    console.log('   users, products, orders, payments, carts, categories,');
    console.log('   blogs, contacts, chatgroups, chatmessages, variants, wishlists');
    console.log('');
    console.log('🚀  Start the app:');
    console.log('   Terminal 1 (backend):  cd backend && npm run dev');
    console.log('   Terminal 2 (frontend): npm run dev');
    console.log('');
} else {
    process.exit(1);
}
