import { API_BASE } from "./api";

export async function fetchScottishActual() {
  const res = await fetch(`${API_BASE}/api/water-levels/scottish-averages/`);
  return res.json();
}

export async function fetchScottishPrediction(model: string) {
  const res = await fetch(`${API_BASE}/api/water-levels/scottishwater/${model}/`);
  return res.json();
}

export async function fetchScottishAccuracy(model: string) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/scottishwater-forecast-accuracy/?model_type=${model}`
  );
  return res.json();
}

export async function fetchSevernTrentActual() {
  const res = await fetch(`${API_BASE}/api/water-levels/severn-trent-reservoirs/`);
  return res.json();
}

export async function fetchSevernTrentPrediction(model: string) {
  const res = await fetch(`${API_BASE}/api/water-levels/severn-trent/${model}`);
  return res.json();
}

export async function fetchSevernTrentAccuracy(model: string) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/severn-trent-prediction-accuracy/?model_type=${model}`
  );
  return res.json();
}

export async function fetchSouthernWaterActual(reservoir: string) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/southernwater-reservoirs/?reservoir=${reservoir}`
  );
  return res.json();
}

export async function fetchSouthernWaterPrediction(
  reservoir: string,
  model: string
) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/southernwater/${reservoir}/${model}`
  );
  return res.json();
}

export async function fetchSouthernWaterAccuracy(
  reservoir: string,
  model: string
) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/southernwater-prediction-accuracy/?reservoir=${reservoir}&model_type=${model}`
  );
  return res.json();
}

export async function fetchYorkshireActual() {
  const res = await fetch(`${API_BASE}/api/water-levels/yorkshire/reservoir-data/`);
  return res.json();
}

export async function fetchYorkshirePrediction() {
  const res = await fetch(`${API_BASE}/api/water-levels/yorkshire-predictions/`);
  return res.json();
}

export async function fetchYorkshireAccuracy(model: string) {
  const res = await fetch(
    `${API_BASE}/api/water-levels/yorkshire-prediction-accuracy/?model_type=${model}`
  );
  return res.json();
}

export async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(
    `${API_BASE}/api/weather/unified/?latitude=${lat}&longitude=${lon}`
  );
  return res.json();
}

