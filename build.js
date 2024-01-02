import { cpSync, createWriteStream, mkdirSync, rmSync } from 'node:fs';
import archiver from 'archiver';

/**
 * Copying files...
 */
rmSync('./dist', { recursive: true });
mkdirSync('./dist');

cpSync('./manifest.json', './dist/manifest.json');
cpSync('./service_worker.js', './dist/service_worker.js');
cpSync('./popup', './dist/popup', { recursive: true });
cpSync('./sites', './dist/sites', { recursive: true });

/**
 * Zipping...
 */
const output = createWriteStream('./dist.zip');
const archive = archiver('zip');

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
});

archive.on('error', function (err) {
  throw err;
});

archive.directory('./dist', false);
archive.pipe(output);
archive.finalize();
