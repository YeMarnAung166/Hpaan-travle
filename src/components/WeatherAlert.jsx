import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Droplets, Thermometer, X } from 'lucide-react';

const ALERT_KEY = 'weatherAlertDismissed';

export default function WeatherAlert() {
  const { t } = useLanguage();
  const [_weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissedUntil, setDismissedUntil] = useState(null);
  const [alert, setAlert] = useState(null);

  function checkAlerts(data) {
    const alerts = [];
    const temp = data.main?.temp;
    const rain = data.rain?.['1h'] || 0;

    if (temp && temp > 35) {
      alerts.push({
        type: 'heat',
        icon: Thermometer,
        message: t('weather.alert_heat') || 'Extreme heat! Stay hydrated and avoid outdoor activities.',
        severity: 'high',
      });
    }

    if (rain > 5) {
      alerts.push({
        type: 'rain',
        icon: Droplets,
        message: t('weather.alert_rain') || 'Heavy rain expected. Be cautious on roads and trails.',
        severity: 'medium',
      });
    }

    if (alerts.length > 0) {
      const combined = alerts.length === 1 ? alerts[0] : {
        type: 'combined',
        icon: AlertTriangle,
        message: alerts.map(a => a.message).join(' '),
        severity: 'high',
      };
      setAlert(combined);
    } else {
      setAlert(null);
    }
  }

  useEffect(() => {
    // Check if dismissed
    const stored = localStorage.getItem(ALERT_KEY);
    if (stored) {
      const until = parseInt(stored, 10);
      if (Date.now() < until) {
        setDismissedUntil(until);
        setLoading(false);
        return;
      } else {
        localStorage.removeItem(ALERT_KEY);
      }
    }

    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=16.889&lon=97.635&units=metric&appid=${apiKey}`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        setWeather(data);
        checkAlerts(data);
      } catch (err) {
        console.error('WeatherAlert error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const dismissAlert = () => {
    const oneHour = 60 * 60 * 1000;
    localStorage.setItem(ALERT_KEY, String(Date.now() + oneHour));
    setDismissedUntil(Date.now() + oneHour);
    setAlert(null);
  };

  if (loading || !alert || dismissedUntil) return null;

  const severityColors = {
    high: 'bg-red-600 border-red-700',
    medium: 'bg-yellow-600 border-yellow-700',
  };
  const color = severityColors[alert.severity] || severityColors.medium;

  return (
    <div className={`${color} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 border-l-4`}>
      <div className="flex items-center gap-3 flex-1">
        <alert.icon className="w-6 h-6 flex-shrink-0" />
        <p className="text-sm font-medium">{alert.message}</p>
      </div>
      <button
        onClick={dismissAlert}
        className="text-white/80 hover:text-white transition p-1"
        aria-label={t('common.dismiss') || 'Dismiss'}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}