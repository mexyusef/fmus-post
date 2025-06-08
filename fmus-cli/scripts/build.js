#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
const examplesDir = path.resolve(rootDir, 'examples');

// Komentar: Load package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Komentar: Hapus direktori dist jika ada
if (fs.existsSync(distDir)) {
  log.info('Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Komentar: Buat direktori dist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'examples'), { recursive: true });

try {
  // Komentar: Jalankan typescript compiler
  log.info('Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit', cwd: rootDir });
  log.success('TypeScript compilation completed.');

  // Komentar: Salin file contoh ke dist
  log.info('Copying example files...');
  fs.readdirSync(examplesDir).forEach(file => {
    const sourcePath = path.join(examplesDir, file);
    const destPath = path.join(distDir, 'examples', file);
    fs.copyFileSync(sourcePath, destPath);
  });
  log.success('Example files copied.');

  // Komentar: Buat file dist/cli.js executable
  log.info('Making CLI executable...');
  fs.chmodSync(path.join(distDir, 'cli.js'), '755');
  log.success('CLI is now executable.');

  // Komentar: Salin file README.md, LICENSE, package.json ke dist
  ['README.md', 'LICENSE'].forEach(file => {
    if (fs.existsSync(path.join(rootDir, file))) {
      fs.copyFileSync(
        path.join(rootDir, file),
        path.join(distDir, file)
      );
    }
  });

  // Komentar: Buat package.json untuk distribusi
  const distPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    bin: packageJson.bin,
    author: packageJson.author,
    license: packageJson.license,
    dependencies: packageJson.dependencies
  };

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(distPackageJson, null, 2)
  );

  log.success('Build completed successfully!');

  // Komentar: Output info
  log.info(`Version: ${packageJson.version}`);
  log.info(`Files: ${fs.readdirSync(distDir).length}`);
  log.info(`To install globally: npm install -g ${path.relative(process.cwd(), distDir)}`);
} catch (error) {
  log.error(`Build failed: ${error.message}`);
  process.exit(1);
}
