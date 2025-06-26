import { API_BASE } from "./api";

interface Station {
  station_id: string;
  name: string;
  region: string;
}

interface Level {
  date: string;
  value: number;
}

interface SeriesPoint {
  date: string;
  value: number;
  stations_reporting: number;
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

export async function fetchRegionLevels(
  region: string,
  start: string,
  minCoverage = 0.8,
) {
  const stationsRes = await fetch(
    `${API_BASE}/api/water-levels/groundwater-stations/`
  );
  const stations: Station[] = await stationsRes.json();
  const regionStations = stations.filter((s) => s.region === region);

  const data: Record<string, number[]> = {};

  await Promise.all(
    regionStations.map(async (st) => {
      const res = await fetch(
        `${API_BASE}/api/water-levels/groundwater-levels/?station__station_id=${st.station_id}&date__gte=${start}`
      );
      const levels: Level[] = await res.json();
      levels.forEach((l) => {
        if (!data[l.date]) data[l.date] = [];
        data[l.date].push(l.value);
      });
    })
  );

  const allDates = Object.keys(data).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const series = allDates.map((date) => ({
    date,
    value: data[date].reduce((a, b) => a + b, 0) / data[date].length,
    stations_reporting: data[date].length,
  }));

  return trimLowCoverage(series, regionStations.length, minCoverage);
}

export async function fetchStationNames(region: string) {
  const stationsRes = await fetch(`${API_BASE}/api/water-levels/groundwater-stations/`);
  const stations: Station[] = await stationsRes.json();
  const names = stations
    .filter((s) => s.region === region)
    .map((s) => s.name);
  return Array.from(new Set(names));
}
