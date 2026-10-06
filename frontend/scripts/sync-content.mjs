// Copies the backend's portfolio.json into public/data so the site can fall back
// to it when the API is unreachable. The backend file is the single source of truth.
import { copyFileSync, mkdirSync } from 'node:fs';

const source = new URL('../../backend/src/main/resources/data/portfolio.json', import.meta.url);
const targetDir = new URL('../public/data/', import.meta.url);

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, new URL('portfolio.json', targetDir));
console.log('Synced portfolio.json into public/data');
