import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transpileModule, ModuleKind } from 'typescript';

async function loadGroundwater() {
  const apiSrc = readFileSync(new URL('./api.ts', import.meta.url), 'utf8');
  const apiJs = transpileModule(apiSrc, {
    compilerOptions: { module: ModuleKind.ESNext },
  }).outputText;
  const apiUrl = `data:text/javascript,${encodeURIComponent(apiJs)}#${Math.random()}`;

  const src = readFileSync(new URL('./groundwater.ts', import.meta.url), 'utf8');
  const rewritten = src.replace(/from "\.\/api"/, `from "${apiUrl}"`);
  const js = transpileModule(rewritten, {
    compilerOptions: { module: ModuleKind.ESNext },
  }).outputText;
  const url = `data:text/javascript,${encodeURIComponent(js)}#${Math.random()}`;
  return await import(url);
}

test('fetchRegionLevels aggregates and sorts data', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchRegionLevels } = await loadGroundwater();

  const stations = [
    { station_id: 'A', name: 'Station A', region: 'north' },
    { station_id: 'B', name: 'Station B', region: 'north' },
    { station_id: 'C', name: 'Station C', region: 'south' },
  ];

  const levels = {
    A: [
      { date: '2024-02-01', value: 10 },
      { date: '2024-02-02', value: 20 },
    ],
    B: [
      { date: '2024-02-01', value: 20 },
      { date: '2024-02-02', value: 40 },
    ],
  };

  const realFetch = global.fetch;
  const called = [];
  global.fetch = async (url) => {
    called.push(url);
    if (url === 'https://api.test/api/water-levels/groundwater-stations/') {
      return { json: async () => stations };
    }
    const match = url.match(/station__station_id=([^&]*)&date__gte=2024-01-01/);
    if (match) {
      return { json: async () => levels[match[1]] || [] };
    }
    throw new Error('Unexpected URL ' + url);
  };

  const res = await fetchRegionLevels('north', '2024-01-01');
  assert.deepEqual(res, [
    { date: '2024-02-01', value: 15 },
    { date: '2024-02-02', value: 30 },
  ]);

  assert.deepEqual(called, [
    'https://api.test/api/water-levels/groundwater-stations/',
    'https://api.test/api/water-levels/groundwater-levels/?station__station_id=A&date__gte=2024-01-01',
    'https://api.test/api/water-levels/groundwater-levels/?station__station_id=B&date__gte=2024-01-01',
  ]);

  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('fetchStationNames returns unique station names for region', async () => {
  process.env.NEXT_PUBLIC_API_URL = 'https://api.test';
  const { fetchStationNames } = await loadGroundwater();

  const stations = [
    { station_id: 'A', name: 'Station A', region: 'north' },
    { station_id: 'B', name: 'Station B', region: 'north' },
    { station_id: 'B', name: 'Station B', region: 'north' },
    { station_id: 'C', name: 'Station C', region: 'south' },
  ];

  const realFetch = global.fetch;
  global.fetch = async (url) => {
    assert.equal(url, 'https://api.test/api/water-levels/groundwater-stations/');
    return { json: async () => stations };
  };

  const names = await fetchStationNames('north');
  assert.deepEqual(names, ['Station A', 'Station B']);

  global.fetch = realFetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});