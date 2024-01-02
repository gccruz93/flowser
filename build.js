import { cpSync, createWriteStream, mkdirSync, rmSync } from 'node:fs';
import archiver from 'archiver';
import packageJson from './package.json' assert { type: 'json' };

console.log(`Building v${packageJson.version}`);

/**
 * Copying files...
 */
try {
  rmSync('./dist', { recursive: true });
} catch (error) {}
mkdirSync('./dist/raw', { recursive: true });

cpSync('./manifest.json', './dist/raw/manifest.json');
cpSync('./service_worker.js', './dist/raw/service_worker.js');
cpSync('./popup', './dist/raw/popup', { recursive: true });
cpSync('./sites', './dist/raw/sites', { recursive: true });

/**
 * Zipping...
 */
const archive = archiver('zip');
const output = createWriteStream(`./dist/flowser-${packageJson.version}.zip`);

output.on('close', () => {
  console.log(archive.pointer() + ' total bytes');
});

archive.on('error', function (err) {
  throw err;
});

archive.directory('./dist/raw', false);
archive.pipe(output);
archive.finalize();
