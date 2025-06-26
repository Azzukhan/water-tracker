import { API_BASE } from "./api";

interface Station {
  station_id: string;
  name: string;
  region: string;
}

export interface SeriesPoint {
  date: string;
  value: number;
  stations_reporting: number;
  total_stations: number;
}

export function trimLowCoverage(
  data: SeriesPoint[],
  totalStations: number,
  minCoverage = 0.8,
) {
  const threshold = Math.ceil(totalStations * minCoverage);
  let lastGoodIdx = -1;
  for (let i = 0; i < data.length; ++i) {
    if (data[i].stations_reporting >= threshold) {
      lastGoodIdx = i;
    }
  }
  return data.slice(0, lastGoodIdx + 1);
}

export async function fetchRegionLevels(region: string, start: string) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/groundwater/region-history/${region}/?start=${start}`
  );
  const data: SeriesPoint[] = await res.json();
  return data;
}

export async function fetchStationNames(region: string) {
  const stationsRes = await fetch(`${API_BASE}/api/water-levels/groundwater-stations/`);
  const stations: Station[] = await stationsRes.json();
  const names = stations
    .filter((s) => s.region === region)
    .map((s) => s.name);
  return Array.from(new Set(names));
}
