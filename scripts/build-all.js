#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Komentar: Log utility
const log = {
  info: (message) => console.log(`\x1b[36mINFO\x1b[0m: ${message}`),
  success: (message) => console.log(`\x1b[32mSUCCESS\x1b[0m: ${message}`),
  error: (message) => console.error(`\x1b[31mERROR\x1b[0m: ${message}`),
  warn: (message) => console.warn(`\x1b[33mWARNING\x1b[0m: ${message}`)
};

// Komentar: Path ke root proyek
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Komentar: Hapus direktori dist jika ada
if (fs.existsSync(distDir)) {
  log.info('Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Komentar: Buat direktori dist
fs.mkdirSync(distDir, { recursive: true });

// Komentar: Fungsi untuk menjalankan perintah di direktori tertentu
function runCommand(command, cwd) {
  try {
    log.info(`Running '${command}' in ${cwd}`);
    execSync(command, {
      stdio: 'inherit',
      cwd: path.resolve(rootDir, cwd)
    });
    return true;
  } catch (error) {
    log.error(`Failed to run '${command}' in ${cwd}: ${error.message}`);
    return false;
  }
}

// Komentar: Fungsi untuk menyalin seluruh direktori
function copyDir(src, dest) {
  // Komentar: Buat direktori tujuan jika belum ada
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Komentar: Baca seluruh isi direktori sumber
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // Komentar: Salin setiap entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Komentar: Recursive copy untuk sub direktori
      copyDir(srcPath, destPath);
    } else {
      // Komentar: Salin file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Komentar: Build komponen-komponen
log.info('Building FMUS-POST components...');

// Komentar: Membangun core library
log.info('Building core library...');
const coreSuccess = runCommand('npm run build', 'fmus-core/bindings/ts');

// Komentar: Membangun CLI
if (coreSuccess) {
  log.info('Building CLI...');
  const cliSuccess = runCommand('npm run build', 'fmus-cli');

  if (cliSuccess) {
    log.success('CLI build successful!');
  } else {
    log.error('CLI build failed!');
  }
}

// Komentar: Membangun UI Tauri (hanya jika diminta)
if (process.argv.includes('--with-ui')) {
  log.info('Building Tauri UI...');
  const uiSuccess = runCommand('npm run build', 'fmus-ui-tauri');

  if (uiSuccess) {
    log.success('Tauri UI build successful!');
  } else {
    log.error('Tauri UI build failed!');
  }
}

// Komentar: Salin file penting ke dist
log.info('Copying files to dist directory...');

// Komentar: Salin README
fs.copyFileSync(
  path.join(rootDir, 'README.md'),
  path.join(distDir, 'README.md')
);

// Komentar: Buat struktur dist/packages
fs.mkdirSync(path.join(distDir, 'packages'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'packages', 'core'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'packages', 'cli'), { recursive: true });

// Komentar: Salin paket-paket
log.info('Copying core library...');
copyDir(
  path.join(rootDir, 'fmus-core/bindings/ts/dist'),
  path.join(distDir, 'packages/core/dist')
);
fs.copyFileSync(
  path.join(rootDir, 'fmus-core/bindings/ts/package.json'),
  path.join(distDir, 'packages/core/package.json')
);
fs.copyFileSync(
  path.join(rootDir, 'fmus-core/bindings/ts/README.md'),
  path.join(distDir, 'packages/core/README.md')
);

log.info('Copying CLI...');
copyDir(
  path.join(rootDir, 'fmus-cli/dist'),
  path.join(distDir, 'packages/cli/dist')
);
fs.copyFileSync(
  path.join(rootDir, 'fmus-cli/package.json'),
  path.join(distDir, 'packages/cli/package.json')
);
fs.copyFileSync(
  path.join(rootDir, 'fmus-cli/README.md'),
  path.join(distDir, 'packages/cli/README.md')
);

log.success('Build completed!');
log.info(`Output directory: ${distDir}`);
log.info('To install globally:');
log.info('  npm install -g ./dist/packages/cli');
log.info('  npm install -g ./dist/packages/core');
