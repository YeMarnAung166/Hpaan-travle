import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RefreshCw } from 'lucide-react';

const CURRENCIES = ['MMK', 'USD', 'THB', 'EUR', 'SGD'];
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export default function CurrencyConverter() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('MMK');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setRates(data.rates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates && amount > 0) {
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      const usdAmount = amount / fromRate;
      setResult(usdAmount * toRate);
    } else {
      setResult(null);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (loading) return <div className="text-center text-gray-500 text-sm">{t('common.loading')}</div>;
  if (error) return <div className="text-center text-red-600 text-sm">⚠️ {error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
        {t('currency.title') || 'Currency Converter'}
      </h3>
      <div className="flex flex-col gap-3">
        {/* Amount + From currency */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="self-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          aria-label="Swap currencies"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Result + To currency */}
        <div className="flex items-center gap-2">
          <div className="w-24 text-lg font-bold text-gray-800 dark:text-gray-100">
            {result !== null ? result.toFixed(2) : '—'}
          </div>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        {t('currency.rates_update') || 'Exchange rates are approximate and may vary.'}
      </p>
    </div>
  );
}