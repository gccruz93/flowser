import { cpSync, mkdirSync, rmSync } from 'node:fs';

rmSync('./dist', { recursive: true });
mkdirSync('./dist');

cpSync('./manifest.json', './dist/manifest.json');
cpSync('./service_worker.js', './dist/service_worker.js');
cpSync('./popup', './dist/popup', { recursive: true });
cpSync('./sites', './dist/sites', { recursive: true });
