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
  const stationsRes = await fetch(
    `${API_BASE}/api/water-levels/groundwater-stations/`
  );
  const stations: Station[] = await stationsRes.json();
  const regionStations = stations.filter((s) => s.region === region);

  const data: Record<string, number[]> = {};
  const dateSets: Set<string>[] = [];

  await Promise.all(
    regionStations.map(async (st) => {
      const res = await fetch(
        `${API_BASE}/api/water-levels/groundwater-levels/?station__station_id=${st.station_id}&date__gte=${start}`
      );
      const levels: Level[] = await res.json();
      const dates = new Set<string>();
      levels.forEach((l) => {
        dates.add(l.date);
        if (!data[l.date]) data[l.date] = [];
        data[l.date].push(l.value);
      });
      dateSets.push(dates);
    })
  );

  if (!dateSets.length) return [];

  let commonDates = dateSets[0];
  for (const ds of dateSets.slice(1)) {
    commonDates = new Set([...commonDates].filter((d) => ds.has(d)));
  }

  const sortedDates = Array.from(commonDates).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return sortedDates.map((date) => ({
    date,
    value: data[date].reduce((a, b) => a + b, 0) / data[date].length,
  }));
}

export async function fetchStationNames(region: string) {
  const stationsRes = await fetch(`${API_BASE}/api/water-levels/groundwater-stations/`);
  const stations: Station[] = await stationsRes.json();
  const names = stations
    .filter((s) => s.region === region)
    .map((s) => s.name);
  return Array.from(new Set(names));
}
