import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';

async function loadWaterApi() {
  const apiSrc = readFileSync(new URL('./api.ts', import.meta.url), 'utf8');
  const apiJs = transpileModule(apiSrc, { compilerOptions: { module: ModuleKind.ESNext } }).outputText;
  const apiUrl = `data:text/javascript,${encodeURIComponent(apiJs)}#${Math.random()}`;

  const src = readFileSync(new URL('./water.ts', import.meta.url), 'utf8');
  const rewritten = src.replace(/from "\.\/api"/, `from "${apiUrl}"`);
  const js = transpileModule(rewritten, { compilerOptions: { module: ModuleKind.ESNext } }).outputText;
  const url = `data:text/javascript,${encodeURIComponent(js)}#${Math.random()}`;
  return await import(url);
}

test('Scottish water API endpoints', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchScottishActual, fetchScottishPrediction, fetchScottishAccuracy } = await loadWaterApi();
  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url.endsWith('scottish-averages/')) return { json: async () => ({ avg: 1 }) };
    if (url.endsWith('scottishwater/LSTM/')) return { json: async () => ({ pred: 2 }) };
    if (url.includes('scottishwater-forecast-accuracy')) return { json: async () => ({ acc: 0.9 }) };
    throw new Error('Unexpected URL ' + url);
  };

  assert.deepEqual(await fetchScottishActual(), { avg: 1 });
  assert.deepEqual(await fetchScottishPrediction('LSTM'), { pred: 2 });
  assert.deepEqual(await fetchScottishAccuracy('LSTM'), { acc: 0.9 });
  assert.deepEqual(called, [
    'https://api.test/api/water-levels/scottish-averages/',
    'https://api.test/api/water-levels/scottishwater/LSTM/',
    'https://api.test/api/water-levels/scottishwater-forecast-accuracy/?model_type=LSTM'
  ]);
  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('Severn Trent API endpoints', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchSevernTrentActual, fetchSevernTrentPrediction, fetchSevernTrentAccuracy } = await loadWaterApi();
  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url.endsWith('severn-trent-reservoirs/')) return { json: async () => ({ levels: [] }) };
    if (url.endsWith('severn-trent/ARIMA')) return { json: async () => ({ forecast: [] }) };
    if (url.includes('severn-trent-prediction-accuracy')) return { json: async () => ({ acc: 0.8 }) };
    throw new Error('Unexpected URL ' + url);
  };

  assert.deepEqual(await fetchSevernTrentActual(), { levels: [] });
  assert.deepEqual(await fetchSevernTrentPrediction('ARIMA'), { forecast: [] });
  assert.deepEqual(await fetchSevernTrentAccuracy('ARIMA'), { acc: 0.8 });
  assert.deepEqual(called, [
    'https://api.test/api/water-levels/severn-trent-reservoirs/',
    'https://api.test/api/water-levels/severn-trent/ARIMA',
    'https://api.test/api/water-levels/severn-trent-prediction-accuracy/?model_type=ARIMA'
  ]);
  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('Southern Water API endpoints', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchSouthernWaterActual, fetchSouthernWaterPrediction, fetchSouthernWaterAccuracy } = await loadWaterApi();
  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url.includes('southernwater-reservoirs')) return { json: async () => ({ levels: [] }) };
    if (url.includes('southernwater/Bewl/LSTM')) return { json: async () => ({ forecast: [] }) };
    if (url.includes('southernwater-prediction-accuracy')) return { json: async () => ({ acc: 0.7 }) };
    throw new Error('Unexpected URL ' + url);
  };

  assert.deepEqual(await fetchSouthernWaterActual('Bewl'), { levels: [] });
  assert.deepEqual(await fetchSouthernWaterPrediction('Bewl', 'LSTM'), { forecast: [] });
  assert.deepEqual(await fetchSouthernWaterAccuracy('Bewl', 'LSTM'), { acc: 0.7 });
  assert.deepEqual(called, [
    'https://api.test/api/water-levels/southernwater-reservoirs/?reservoir=Bewl',
    'https://api.test/api/water-levels/southernwater/Bewl/LSTM',
    'https://api.test/api/water-levels/southernwater-prediction-accuracy/?reservoir=Bewl&model_type=LSTM'
  ]);
  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('Yorkshire Water API endpoints', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchYorkshireActual, fetchYorkshirePrediction, fetchYorkshireAccuracy } = await loadWaterApi();
  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url.endsWith('yorkshire/reservoir-data/')) return { json: async () => ({ levels: [] }) };
    if (url.endsWith('yorkshire-predictions/')) return { json: async () => ({ forecast: [] }) };
    if (url.includes('yorkshire-prediction-accuracy')) return { json: async () => ({ acc: 0.85 }) };
    throw new Error('Unexpected URL ' + url);
  };

  assert.deepEqual(await fetchYorkshireActual(), { levels: [] });
  assert.deepEqual(await fetchYorkshirePrediction(), { forecast: [] });
  assert.deepEqual(await fetchYorkshireAccuracy('REGRESSION'), { acc: 0.85 });
  assert.deepEqual(called, [
    'https://api.test/api/water-levels/yorkshire/reservoir-data/',
    'https://api.test/api/water-levels/yorkshire-predictions/',
    'https://api.test/api/water-levels/yorkshire-prediction-accuracy/?model_type=REGRESSION'
  ]);
  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('Weather API endpoint', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchWeather } = await loadWaterApi();
  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url.includes('/api/weather/unified/')) return { json: async () => ({ weather: 'ok' }) };
    throw new Error('Unexpected URL ' + url);
  };

  assert.deepEqual(await fetchWeather(51.5, -0.1), { weather: 'ok' });
  assert.deepEqual(called, [
    'https://api.test/api/weather/unified/?latitude=51.5&longitude=-0.1'
  ]);
  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

