from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"


WEATHER_CODES = {
    0: ("Clear", "Sun is in full command."),
    1: ("Mostly Clear", "Calm skies with a little drama."),
    2: ("Partly Cloudy", "Cloud cover with swagger."),
    3: ("Overcast", "Heavy sky, serious mood."),
    45: ("Fog", "Low visibility, high cinematic value."),
    48: ("Rime Fog", "Frozen haze and sharp edges."),
    51: ("Light Drizzle", "Fine mist, barely a warning shot."),
    53: ("Drizzle", "Steady light rain."),
    55: ("Dense Drizzle", "Persistent wet air."),
    56: ("Freezing Drizzle", "Slippery and dangerous."),
    57: ("Dense Freezing Drizzle", "Frozen mist with bite."),
    61: ("Light Rain", "Light rain in the area."),
    63: ("Rain", "The sky is committing."),
    65: ("Heavy Rain", "Hard rain, no half measures."),
    66: ("Freezing Rain", "Ice-loaded rainfall."),
    67: ("Heavy Freezing Rain", "Severe icing conditions."),
    71: ("Light Snow", "Light snowfall."),
    73: ("Snow", "Accumulating snow on deck."),
    75: ("Heavy Snow", "Serious snowfall."),
    77: ("Snow Grains", "Fine frozen particles."),
    80: ("Rain Showers", "Burst rain on and off."),
    81: ("Heavy Showers", "Aggressive showers moving through."),
    82: ("Violent Showers", "Turbulent rain bands."),
    85: ("Snow Showers", "Short snow bursts."),
    86: ("Heavy Snow Showers", "Fast and furious snow."),
    95: ("Thunderstorm", "Electrical chaos in the atmosphere."),
    96: ("Storm + Hail", "Thunderstorm with hail risk."),
    99: ("Severe Storm + Hail", "Major convective threat."),
}


def fetch_json(url: str, extra_headers: dict[str, str] | None = None) -> dict:
    headers = {
        "User-Agent": "WeatherStation/1.0",
        "Accept": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)
    request = urllib.request.Request(
        url,
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def query_locations(query: str, count: int) -> list[dict]:
    params = urllib.parse.urlencode({"name": query, "count": count, "language": "en", "format": "json"})
    payload = fetch_json(f"https://geocoding-api.open-meteo.com/v1/search?{params}")
    return payload.get("results") or []


def location_query_variants(query: str) -> list[str]:
    cleaned = " ".join(query.replace(",", " ").split())
    variants = [query.strip(), cleaned]
    if "," in query:
        parts = [part.strip() for part in query.split(",") if part.strip()]
        if parts:
            variants.append(parts[0])
        if len(parts) >= 2:
            variants.append(f"{parts[0]} {parts[1]}")
    deduped = []
    for item in variants:
        if item and item not in deduped:
            deduped.append(item)
    return deduped


def geocode_city(city: str) -> dict:
    for variant in location_query_variants(city):
        results = query_locations(variant, 1)
        if results:
            return results[0]
    raise LookupError(f"No forecast target found for '{city}'.")


def search_locations(query: str) -> list[dict]:
    results = []
    seen = set()
    for variant in location_query_variants(query):
        for place in query_locations(variant, 8):
            key = (place["name"], place.get("admin1"), place.get("country"), place["latitude"], place["longitude"])
            if key in seen:
                continue
            seen.add(key)
            results.append(place)
        if results:
            break
    suggestions = []
    for place in results:
        suggestions.append(
            {
                "city": place["name"],
                "admin1": place.get("admin1"),
                "country": place.get("country"),
                "latitude": place["latitude"],
                "longitude": place["longitude"],
            }
        )
    return suggestions


def reverse_geocode_open_meteo(latitude: float, longitude: float) -> dict | None:
    params = urllib.parse.urlencode(
        {
            "latitude": latitude,
            "longitude": longitude,
            "language": "en",
            "format": "json",
        }
    )
    payload = fetch_json(f"https://geocoding-api.open-meteo.com/v1/reverse?{params}")
    results = payload.get("results") or []
    return results[0] if results else None


def reverse_geocode_nominatim(latitude: float, longitude: float) -> dict | None:
    params = urllib.parse.urlencode(
        {
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "zoom": 14,
            "addressdetails": 1,
        }
    )
    payload = fetch_json(
        f"https://nominatim.openstreetmap.org/reverse?{params}",
        extra_headers={"Accept-Language": "en-US,en;q=0.9"},
    )
    address = payload.get("address") or {}
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("hamlet")
        or address.get("municipality")
        or address.get("suburb")
        or address.get("city_district")
        or address.get("county")
    )
    if not city:
        return None
    return {
        "name": city,
        "admin1": address.get("state"),
        "country": address.get("country"),
        "latitude": latitude,
        "longitude": longitude,
    }


def resolve_place(city: str | None = None, latitude: float | None = None, longitude: float | None = None) -> dict:
    if city:
        return geocode_city(city)

    if latitude is None or longitude is None:
        raise LookupError("No forecast target provided.")

    for resolver in (reverse_geocode_open_meteo, reverse_geocode_nominatim):
        try:
            place = resolver(latitude, longitude)
            if place:
                return place
        except (urllib.error.URLError, TimeoutError):
            continue

    return {
        "name": "Current Location",
        "admin1": None,
        "country": None,
        "latitude": latitude,
        "longitude": longitude,
    }


def build_forecast(city: str | None = None, latitude: float | None = None, longitude: float | None = None) -> dict:
    place = resolve_place(city=city, latitude=latitude, longitude=longitude)
    params = urllib.parse.urlencode(
        {
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "current": ",".join(
                [
                    "temperature_2m",
                    "apparent_temperature",
                    "relative_humidity_2m",
                    "is_day",
                    "precipitation",
                    "rain",
                    "showers",
                    "snowfall",
                    "cloud_cover",
                    "weather_code",
                    "wind_speed_10m",
                    "wind_gusts_10m",
                    "surface_pressure",
                    "visibility",
                    "uv_index",
                ]
            ),
            "hourly": ",".join(
                [
                    "temperature_2m",
                    "precipitation_probability",
                    "weather_code",
                    "wind_speed_10m",
                ]
            ),
            "daily": ",".join(
                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_probability_max",
                    "wind_speed_10m_max",
                    "sunrise",
                    "sunset",
                ]
            ),
            "timezone": "auto",
            "forecast_days": 7,
            "temperature_unit": "fahrenheit",
            "wind_speed_unit": "mph",
            "precipitation_unit": "inch",
        }
    )
    payload = fetch_json(f"https://api.open-meteo.com/v1/forecast?{params}")
    current = payload["current"]
    hourly = payload["hourly"]
    daily = payload["daily"]
    current_code = current["weather_code"]
    title, tagline = WEATHER_CODES.get(current_code, ("Wild Weather", "The atmosphere is improvising."))

    days = []
    for index, day in enumerate(daily["time"]):
        day_code = daily["weather_code"][index]
        day_title, _ = WEATHER_CODES.get(day_code, ("Unmapped", ""))
        days.append(
            {
                "date": day,
                "label": day_title,
                "weatherCode": day_code,
                "tempMax": round(daily["temperature_2m_max"][index]),
                "tempMin": round(daily["temperature_2m_min"][index]),
                "precipChance": daily["precipitation_probability_max"][index],
                "windMax": round(daily["wind_speed_10m_max"][index]),
                "sunrise": daily["sunrise"][index],
                "sunset": daily["sunset"][index],
            }
        )

    hourly_outlook = []
    for index, timestamp in enumerate(hourly["time"]):
        if timestamp < current["time"]:
            continue
        hour_code = hourly["weather_code"][index]
        hour_title, _ = WEATHER_CODES.get(hour_code, ("Unmapped", ""))
        hourly_outlook.append(
            {
                "time": timestamp,
                "label": hour_title,
                "weatherCode": hour_code,
                "temperature": round(hourly["temperature_2m"][index]),
                "precipChance": hourly["precipitation_probability"][index],
                "windSpeed": round(hourly["wind_speed_10m"][index]),
            }
        )
        if len(hourly_outlook) == 12:
            break

    return {
        "location": {
            "city": place["name"],
            "admin1": place.get("admin1"),
            "country": place.get("country"),
            "latitude": place["latitude"],
            "longitude": place["longitude"],
            "timezone": payload["timezone"],
        },
        "current": {
            "title": title,
            "tagline": tagline,
            "temperature": round(current["temperature_2m"]),
            "feelsLike": round(current["apparent_temperature"]),
            "humidity": current["relative_humidity_2m"],
            "precipitation": round(
                current["precipitation"] + current["rain"] + current["showers"] + current["snowfall"], 1
            ),
            "cloudCover": current["cloud_cover"],
            "windSpeed": round(current["wind_speed_10m"]),
            "windGusts": round(current["wind_gusts_10m"]),
            "pressure": round(current["surface_pressure"]),
            "visibility": round(current["visibility"] / 1609.34, 1),
            "uvIndex": round(current["uv_index"], 1),
            "weatherCode": current_code,
            "isDay": bool(current["is_day"]),
        },
        "hourly": hourly_outlook,
        "daily": days,
    }


class WeatherHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/forecast":
            self.handle_forecast(parsed.query)
            return
        if parsed.path == "/api/locations":
            self.handle_locations(parsed.query)
            return
        if parsed.path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def handle_forecast(self, query_string: str) -> None:
        params = urllib.parse.parse_qs(query_string)
        city = (params.get("city") or [""])[0].strip() or None
        latitude = (params.get("lat") or [None])[0]
        longitude = (params.get("lon") or [None])[0]
        try:
            default_city = city or ("New York" if latitude is None or longitude is None else None)
            payload = build_forecast(
                city=default_city,
                latitude=float(latitude) if latitude is not None else None,
                longitude=float(longitude) if longitude is not None else None,
            )
            body = json.dumps(payload).encode("utf-8")
            self.send_response(HTTPStatus.OK)
        except LookupError as error:
            body = json.dumps({"error": str(error)}).encode("utf-8")
            self.send_response(HTTPStatus.NOT_FOUND)
        except ValueError:
            body = json.dumps({"error": "Bad coordinates on the wire."}).encode("utf-8")
            self.send_response(HTTPStatus.BAD_REQUEST)
        except (urllib.error.URLError, TimeoutError):
            body = json.dumps(
                {"error": "Weather upstream is unreachable right now. Check your connection and try again."}
            ).encode("utf-8")
            self.send_response(HTTPStatus.BAD_GATEWAY)
        except Exception:
            body = json.dumps({"error": "Forecast systems took a hit. Try again in a moment."}).encode("utf-8")
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)

        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def handle_locations(self, query_string: str) -> None:
        params = urllib.parse.parse_qs(query_string)
        query = (params.get("q") or [""])[0].strip()
        try:
            if len(query) < 2:
                body = json.dumps({"results": []}).encode("utf-8")
                self.send_response(HTTPStatus.OK)
            else:
                body = json.dumps({"results": search_locations(query)}).encode("utf-8")
                self.send_response(HTTPStatus.OK)
        except (urllib.error.URLError, TimeoutError):
            body = json.dumps({"results": [], "error": "Search is down bad right now."}).encode("utf-8")
            self.send_response(HTTPStatus.BAD_GATEWAY)
        except Exception:
            body = json.dumps({"results": [], "error": "Location search caught an attitude."}).encode("utf-8")
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)

        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def run() -> None:
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), WeatherHandler)
    print(f"WeatherStation online at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
