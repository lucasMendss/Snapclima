export default async function handler(req, res) {
  const city = req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const origin = req.headers.origin;
  const normalizedOrigin = origin?.toLowerCase();

  const isVercelNormalOrigin = 
    normalizedOrigin === "https://snapclima-one.vercel.app";

  const isVercelPreviewOrigin =
    normalizedOrigin &&
    /^https:\/\/snapclima-[a-z0-9-]+-lucasmendss(?:-projects)?\.vercel\.app$/i.test(normalizedOrigin);

  const isLocalOrigin =
    normalizedOrigin &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);

  if (origin && (isVercelNormalOrigin || isLocalOrigin || isVercelPreviewOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ message: "Informe o nome de uma cidade ou latitude e longitude" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY_2;

  const base = "https://api.openweathermap.org/data/2.5/weather";
  const params = new URLSearchParams({
    units: "metric",
    lang: "pt_br",
    appid: apiKey
  });

  if (city) params.set("q", city);
  if (lat && lon) {
    params.set("lat", lat);
    params.set("lon", lon);
  }

  try {
    const response = await fetch(base + "?" + params.toString());
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno ao consultar clima" });
  }
}