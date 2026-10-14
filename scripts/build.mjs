// Build sem rede: esbuild + React/GSAP locais. Gera dist/index.html (arquivo único).
// Com acesso ao npm, o projeto também roda com Vite (npm i && npm run dev).
import { build } from '/opt/npm-tools/node_modules/esbuild/lib/main.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const res = await build({
  entryPoints: [path.join(root, 'src/main.jsx')],
  bundle: true, write: false, minify: true, format: 'iife', target: 'es2020',
  jsx: 'automatic', outdir: 'out', loader: { '.js': 'jsx', '.jpg': 'dataurl' },
  nodePaths: ['/opt/npm-tools/node_modules'],
  alias: { gsap: path.join(root, 'vendor/gsap-esm.js'), 'gsap/ScrollTrigger': path.join(root, 'vendor/ScrollTrigger-esm.js') },
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': JSON.stringify(Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('VITE_')))) },
  logLevel: 'warning',
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text;
const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text || '';
let html = readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('<script type="module" src="/src/main.jsx"></script>', () => `<script>${js.replace(/<\/script/g, '<\\/script')}</script>`)
  .replace('</head>', () => `<style>${css}</style></head>`);
mkdirSync(path.join(root, 'dist'), { recursive: true });
writeFileSync(path.join(root, 'dist/index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(0) + ' KB');

// Variante para publicar como artifact: o publicador adiciona o esqueleto <html>/<head>/<body>.
const body = html
  .replace(/^<!doctype html>\s*<html[^>]*>\s*<head>/i, '')
  .replace(/<\/head>\s*<body>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '')
  .replace('<meta charset="utf-8" />', '')
  .replace('<meta name="viewport" content="width=device-width, initial-scale=1" />', '');
writeFileSync(path.join(root, 'dist/artifact.html'), body);
console.log('dist/artifact.html', (body.length / 1024).toFixed(0) + ' KB');
