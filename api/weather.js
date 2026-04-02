export default async function handler(req, res) {
  const city = req.query.city;
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ message: "Informe city ou lat/lon" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

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

    res.setHeader("Access-Control-Allow-Origin", "https://SEU-USUARIO.github.io");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Erro interno ao consultar clima" });
  }
}