import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';

async function loadApiBase() {
  const src = readFileSync(new URL('./api.ts', import.meta.url), 'utf8');
  const js = transpileModule(src, { compilerOptions: { module: ModuleKind.ESNext } }).outputText;
  const url = `data:text/javascript,${encodeURIComponent(js)}#${Math.random()}`;
  const { API_BASE } = await import(url);
  return API_BASE;
}

test('API_BASE defaults to local Django server when env var missing', async () => {
  delete process.env.NEXT_PUBLIC_API_URL;
  const base = await loadApiBase();
  assert.equal(base, 'http://127.0.0.1:8000');
});

test('API_BASE uses NEXT_PUBLIC_API_URL when provided', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  const base = await loadApiBase();
  assert.equal(base, 'https://api.example.com');
  delete process.env.NEXT_PUBLIC_API_URL;
});
