import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const expoRoot = process.cwd();
const distDir = path.resolve(expoRoot, '../neon-hoops-app/dist');
const indexPath = path.join(distDir, 'index.html');

const indexHtml = readFileSync(indexPath, 'utf8');
const scriptTagMatch = indexHtml.match(/<script[^>]*src="([^"]+\.js)"[^>]*><\/script>/i);

if (!scriptTagMatch) {
  throw new Error('Unable to find built JS asset in neon-hoops-app/dist/index.html');
}

const scriptPath = path.join(distDir, scriptTagMatch[1].replace(/^\//, ''));
const builtJs = readFileSync(scriptPath, 'utf8');

const inlinedHtml = indexHtml.replace(scriptTagMatch[0], `<script>${builtJs}</script>`);
const escaped = inlinedHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const outDir = path.join(expoRoot, 'src');
const outPath = path.join(outDir, 'generatedGameHtml.js');

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `export const GAME_HTML = String.raw\`${escaped}\`;\n`, 'utf8');

console.log(`Generated ${outPath}`);
