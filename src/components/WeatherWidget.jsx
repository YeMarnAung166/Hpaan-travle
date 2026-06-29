import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, language } = useLanguage();

  // Coordinates for Hpa‑An (approximate)
  const lat = 16.889;
  const lon = 97.635;
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Weather API key missing');
      setLoading(false);
      return;
    }

    const CACHE_KEY = 'hpaan_weather_cache';
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setWeather(data.weather);
          setForecast(data.forecast);
          setLoading(false);
          return;
        }
      } catch (_) {}
    }

    const fetchWeather = async () => {
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`),
        ]);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        if (!forecastRes.ok) throw new Error('Forecast fetch failed');

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        // Group by day and take the midday forecast (approx 12:00)
        const dailyForecasts = {};
        forecastData.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!dailyForecasts[date] && item.dt_txt.includes('12:00:00')) {
            dailyForecasts[date] = item;
          }
        });
        const nextDays = Object.values(dailyForecasts).slice(1, 4);

        setWeather(weatherData);
        setForecast(nextDays);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { weather: weatherData, forecast: nextDays },
          timestamp: Date.now(),
        }));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md p-4 animate-pulse">
        <div className="h-6 bg-neutral-mid rounded w-1/3 mb-3"></div>
        <div className="h-10 bg-neutral-mid rounded w-full mb-2"></div>
        <div className="h-4 bg-neutral-mid rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md p-4 text-center text-text-soft">
        <p>⚠️ Weather unavailable</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  // Helper to get weather icon URL
  const getIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

  // Format date
  const formatDate = (timestamp, isDay = false) => {
    const date = new Date(timestamp * 1000);
    if (isDay) {
      return date.toLocaleDateString(language === 'my' ? 'my' : 'en', { weekday: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString(language === 'my' ? 'my' : 'en', { hour: '2-digit', minute: '2-digit' });
  };

  const dayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'my' ? 'my' : 'en', { weekday: 'short' });
  };

  return (
    <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-neutral-mid">
        <h3 className="text-lg font-semibold text-text">{t('weather.title') || 'Hpa‑An Weather'}</h3>
      </div>
      <div className="p-4">
        {/* Current weather */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={getIconUrl(weather.weather[0].icon)} alt={weather.weather[0].description} className="w-16 h-16" />
            <div>
              <div className="text-3xl font-bold text-text">{Math.round(weather.main.temp)}°C</div>
              <div className="text-text-soft capitalize">{weather.weather[0].description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-soft">Feels like {Math.round(weather.main.feels_like)}°C</div>
            <div className="text-sm text-text-soft">Humidity: {weather.main.humidity}%</div>
            <div className="text-sm text-text-soft">Wind: {Math.round(weather.wind.speed * 3.6)} km/h</div>
          </div>
        </div>

        {/* 3‑day forecast */}
        {forecast.length > 0 && (
          <>
            <div className="border-t border-neutral-mid pt-4 mb-3">
              <h4 className="text-md font-medium text-text mb-3">{t('weather.forecast') || '3‑Day Forecast'}</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {forecast.map((day, idx) => (
                <div key={idx} className="bg-neutral-light dark:bg-neutral-mid rounded-lg p-2">
                  <div className="text-sm font-medium text-text">{dayName(day.dt_txt)}</div>
                  <img src={getIconUrl(day.weather[0].icon)} alt={day.weather[0].description} className="w-10 h-10 mx-auto" />
                  <div className="text-sm font-bold text-text">{Math.round(day.main.temp)}°C</div>
                  <div className="text-xs text-text-soft capitalize">{day.weather[0].description.substring(0, 10)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}