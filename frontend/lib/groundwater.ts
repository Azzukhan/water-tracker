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

export async function fetchRegionLevels(region: string, start: string) {
  const stationsRes = await fetch(`${API_BASE}/api/water-levels/groundwater-stations/`);
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

  return Object.entries(data)
    .map(([date, vals]) => ({
      date,
      value: vals.reduce((a, b) => a + b, 0) / vals.length,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchStationNames(region: string) {
  const stationsRes = await fetch(`${API_BASE}/api/water-levels/groundwater-stations/`);
  const stations: Station[] = await stationsRes.json();
  return stations.filter((s) => s.region === region).map((s) => s.name);
}
