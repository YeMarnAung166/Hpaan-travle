import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createTextPart(text) {
  return { type: 'text', text };
}

function createToolPart(toolName, output) {
  return { type: `tool-${toolName}`, state: 'output-available', output };
}

function extractKeywords(text) {
  const stopWords = new Set(['the', 'a', 'an', 'in', 'of', 'for', 'to', 'and', 'is', 'are', 'what', 'which', 'where', 'when', 'how', 'some', 'any', 'about', 'with', 'at', 'by', 'from', 'do', 'does', 'did', 'can', 'will', 'would', 'could', 'should', 'may', 'might', 'please', 'tell', 'me', 'show', 'find', 'looking', 'need', 'want', 'like', 'know', 'has', 'have', 'been', 'been', 'were', 'was', 'there', 'their', 'they', 'this', 'that', 'these', 'those', 'my', 'your', 'our', 'its', 'his', 'her', 'not', 'no', 'but', 'or', 'if', 'so', 'than', 'too', 'very', 'just', 'also', 'more', 'most', 'best', 'good', 'great', 'nice']);
  return text.toLowerCase()
    .replace(/[?,.'"!]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function detectIntent(keywords) {
  const destWords = ['cave', 'caves', 'pagoda', 'mountain', 'lake', 'temple', 'waterfall', 'attraction', 'attractions', 'destination', 'destinations', 'place', 'places', 'sight', 'sights', 'landmark', 'landmarks', 'view', 'viewpoint', 'nature', 'hike', 'hiking', 'climb', 'trek', 'trekking'];
  const bizWords = ['restaurant', 'restaurants', 'food', 'eat', 'dining', 'hotel', 'hotels', 'stay', 'lodging', 'accommodation', 'accommodations', 'hostel', 'guesthouse', 'shop', 'store', 'market', 'transport', 'bus', 'taxi', 'rental', 'tour', 'tours', 'guide', 'business', 'businesses', 'company'];
  const weatherWords = ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'humid', 'forecast', 'climate', 'hot', 'cold', 'warm'];
  const eventWords = ['event', 'events', 'festival', 'festivals', 'celebration', 'upcoming', 'happening', 'schedule', 'calendar'];

  const destScore = keywords.filter(k => destWords.includes(k)).length;
  const bizScore = keywords.filter(k => bizWords.includes(k)).length;
  const weatherScore = keywords.filter(k => weatherWords.includes(k)).length;
  const eventScore = keywords.filter(k => eventWords.includes(k)).length;

  const scores = [
    { intent: 'destinations', score: destScore },
    { intent: 'businesses', score: bizScore },
    { intent: 'weather', score: weatherScore },
    { intent: 'events', score: eventScore },
    { intent: 'general', score: 0.5 },
  ];

  const threshold = Math.max(destScore, bizScore, weatherScore, eventScore) * 0.5;
  const detected = scores.filter(s => s.score >= threshold && s.score > 0);

  if (detected.length > 0) return detected.map(d => d.intent);
  return ['general'];
}

const weatherCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30 * 60 * 1000;

async function fetchWeather() {
  if (weatherCache.data && Date.now() - weatherCache.timestamp < CACHE_TTL) {
    return weatherCache.data;
  }
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return null;
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=16.889&lon=97.635&units=metric&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=16.889&lon=97.635&units=metric&appid=${apiKey}`),
    ]);
    if (!weatherRes.ok || !forecastRes.ok) return null;

    const w = await weatherRes.json();
    const f = await forecastRes.json();

    const daily = {};
    f.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date] && item.dt_txt.includes('12:00:00')) {
        daily[date] = item;
      }
    });

    const result = {
      current: {
        temp: Math.round(w.main.temp),
        feels_like: Math.round(w.main.feels_like),
        humidity: w.main.humidity,
        wind_speed: Math.round(w.wind.speed * 3.6),
        description: w.weather[0].description,
        icon: w.weather[0].icon,
      },
      forecast: Object.values(daily).slice(1, 4).map(d => ({
        date: d.dt_txt.split(' ')[0],
        temp: Math.round(d.main.temp),
        description: d.weather[0].description,
        icon: d.weather[0].icon,
      })),
    };

    weatherCache.data = result;
    weatherCache.timestamp = Date.now();
    return result;
  } catch {
    return null;
  }
}

async function searchDestinations(query) {
  try {
    const keywords = extractKeywords(query).join(' ');
    if (!keywords) return [];
    const { data } = await supabase
      .from('destinations')
      .select('id, name, name_my, description, description_my, type, image, lat, lng')
      .or(`name.ilike.%${keywords}%,name_my.ilike.%${keywords}%,description.ilike.%${keywords}%,description_my.ilike.%${keywords}%`)
      .limit(10);
    return data || [];
  } catch { return []; }
}

async function searchBusinesses(query, category) {
  try {
    const keywords = extractKeywords(query).join(' ');
    let dbQuery = supabase
      .from('businesses')
      .select('id, name, name_my, description, description_my, category, image, address, address_my, phone, lat, lng');
    if (category) dbQuery = dbQuery.eq('category', category);
    if (keywords) dbQuery = dbQuery.or(`name.ilike.%${keywords}%,name_my.ilike.%${keywords}%,description.ilike.%${keywords}%`);
    dbQuery = dbQuery.limit(10);
    const { data } = await dbQuery;
    if (!data || data.length === 0) return [];

    const ids = data.map(b => b.id);
    const { data: ratings } = await supabase
      .from('business_reviews')
      .select('business_id, rating')
      .in('business_id', ids);

    const ratingMap = {};
    if (ratings) {
      ratings.forEach(r => {
        if (!ratingMap[r.business_id]) ratingMap[r.business_id] = { sum: 0, count: 0 };
        ratingMap[r.business_id].sum += r.rating;
        ratingMap[r.business_id].count += 1;
      });
    }

    return data.map(b => ({
      ...b,
      avg_rating: ratingMap[b.id] ? Math.round((ratingMap[b.id].sum / ratingMap[b.id].count) * 10) / 10 : null,
      review_count: ratingMap[b.id]?.count || 0,
    }));
  } catch { return []; }
}

async function fetchEvents() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('events')
      .select('id, name, name_my, description, description_my, date, location, image')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(10);
    return data || [];
  } catch { return []; }
}

async function fetchPopularDestinations() {
  try {
    const { data } = await supabase
      .from('destinations')
      .select('id, name, name_my, description, description_my, type, image, lat, lng')
      .limit(6);
    return data || [];
  } catch { return []; }
}

function composePrompt(userMessage, intents, data, conversationHistory) {
  let prompt = 'You are a friendly travel assistant for Hpa-An, Myanmar. Answer concisely and helpfully.';
  prompt += '\n\nCurrent conversation context:';

  const recentHistory = conversationHistory.slice(-4);
  recentHistory.forEach(msg => {
    if (msg.role === 'user') {
      const textPart = msg.parts?.find(p => p.type === 'text');
      if (textPart) prompt += `\nUser: ${textPart.text}`;
    }
  });

  prompt += `\nUser: ${userMessage}`;

  const dests = data.destinations?.length > 0 ? data.destinations : (data.popular || []);
  if (dests.length > 0) {
    prompt += '\n\nRelevant destinations found:';
    dests.forEach(d => {
      prompt += `\n- ${d.name || d.name_my}${d.description ? ': ' + d.description : ''}${d.type ? ' (' + d.type + ')' : ''}`;
    });
  }

  if (data.businesses?.length > 0) {
    prompt += '\n\nRelevant businesses found:';
    data.businesses.forEach(b => {
      prompt += `\n- ${b.name || b.name_my} (${b.category})${b.description ? ': ' + b.description : ''}`;
    });
  }

  if (data.weather) {
    const w = data.weather;
    prompt += `\n\nCurrent weather in Hpa-An: ${w.current.temp}°C, ${w.current.description}. Humidity: ${w.current.humidity}%, Wind: ${w.current.wind_speed} km/h.`;
    if (w.forecast?.length > 0) {
      prompt += '\n3-day forecast:';
      w.forecast.forEach(d => {
        prompt += `\n- ${d.date}: ${d.temp}°C, ${d.description}`;
      });
    }
  }

  if (data.events?.length > 0) {
    prompt += '\n\nUpcoming events:';
    data.events.forEach(e => {
      prompt += `\n- ${e.name || e.name_my} on ${e.date}${e.location ? ' at ' + e.location : ''}`;
    });
  }

  prompt += '\n\nProvide a brief, friendly answer. Keep it to 2-4 sentences.';
  return prompt;
}

export default function useLocalAIChat() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    const userMsg = {
      id: generateId(),
      role: 'user',
      parts: [createTextPart(text)],
    };

    const assistantMsg = {
      id: generateId(),
      role: 'assistant',
      parts: [],
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStatus('generating');
    setError(null);

    try {
      const keywords = extractKeywords(text);
      const intents = detectIntent(keywords);
      const retrievedData = {};

      const isGeneralOnly = intents.length === 1 && intents[0] === 'general';

      const queries = [];
      if (intents.includes('destinations') || isGeneralOnly) {
        queries.push(
          searchDestinations(text).then(data => { retrievedData.destinations = data; }),
        );
      }
      if (intents.includes('businesses') || isGeneralOnly) {
        queries.push(
          searchBusinesses(text).then(data => { retrievedData.businesses = data; }),
        );
      }
      if (intents.includes('weather')) {
        queries.push(
          fetchWeather().then(data => { retrievedData.weather = data; }),
        );
      }
      if (intents.includes('events')) {
        queries.push(
          fetchEvents().then(data => { retrievedData.events = data; }),
        );
      }
      if (isGeneralOnly) {
        queries.push(
          fetchPopularDestinations().then(data => { retrievedData.popular = data; }),
        );
      }

      await Promise.race([
        Promise.all(queries),
        new Promise((_, reject) => setTimeout(() => reject(new Error('data_timeout')), 6000)),
      ]).catch(() => {
        console.warn('Data fetching timed out, proceeding with partial data');
      });

      const parts = [];

      const finalDestinations = retrievedData.destinations?.length > 0
        ? retrievedData.destinations
        : (retrievedData.popular || []);
      if (finalDestinations.length > 0) {
        parts.push(createToolPart('searchDestinations', finalDestinations));
      }
      if (retrievedData.businesses?.length > 0) {
        parts.push(createToolPart('searchBusinesses', retrievedData.businesses));
      }
      if (retrievedData.weather) {
        parts.push(createToolPart('getCurrentWeather', retrievedData.weather));
      }
      if (retrievedData.events?.length > 0) {
        parts.push(createToolPart('getUpcomingEvents', retrievedData.events));
      }

      const prompt = composePrompt(text, intents, retrievedData, messages);

      let responseText;
      try {
        const TIMEOUT_MS = 8000;
        const result = await Promise.race([
          supabase.functions.invoke('ai-chat', { body: { prompt } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
        ]);
        if (result?.error || !result?.data?.response) {
          responseText = generateFallbackResponse(text, intents, retrievedData);
        } else {
          responseText = result.data.response;
        }
      } catch (err) {
        console.warn('Edge function error/timeout, using fallback:', err.message);
        responseText = generateFallbackResponse(text, intents, retrievedData);
      }

      parts.unshift(createTextPart(responseText));

      setMessages(prev => prev.map(m =>
        m.id === assistantMsg.id ? { ...m, parts } : m
      ));
      setStatus('ready');
    } catch (err) {
      console.error('AI chat error:', err);
      setError(err.message || 'Something went wrong');
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
      setStatus('ready');
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    setStatus('ready');
  }, []);

  return {
    messages,
    sendMessage,
    status,
    error,
    clearChat,
    stop,
  };
}

function generateFallbackResponse(text, intents, data) {
  const hasData = Object.values(data).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

  if (!hasData) {
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi ')) {
      return 'Hello! I\'m your Hpa-An travel assistant. Ask me about caves, restaurants, weather, or events!';
    }
    return 'I couldn\'t find specific information about that. Try asking about destinations like caves and pagodas, restaurants, the weather, or upcoming events in Hpa-An!';
  }

  const dest = data.destinations?.length > 0 ? data.destinations : (data.popular || []);
  const biz = data.businesses || [];
  const weather = data.weather;
  const events = data.events || [];

  let response = '';

  if (weather) {
    response = `The weather in Hpa-An is ${weather.current.description} at ${weather.current.temp}°C. Feels like ${weather.current.feels_like}°C. ${weather.forecast?.length > 0 ? 'Forecast: ' + weather.forecast.map(d => `${d.date}: ${d.temp}°C`).join(', ') : ''}`;
  } else if (dest.length > 0) {
    response = `Here are some places I found: ${dest.slice(0, 3).map(d => d.name || d.name_my).join(', ')}`;
    if (dest.length > 3) response += `, and ${dest.length - 3} more.`;
  } else if (biz.length > 0) {
    response = `I found these businesses: ${biz.slice(0, 3).map(b => (b.name || b.name_my) + ' (' + b.category + ')').join(', ')}`;
    if (biz.length > 3) response += `, and ${biz.length - 3} more.`;
  } else if (events.length > 0) {
    response = `Upcoming events: ${events.slice(0, 3).map(e => (e.name || e.name_my) + ' on ' + new Date(e.date).toLocaleDateString()).join(', ')}`;
  } else {
    response = 'I found some information for you. Check the cards above for details!';
  }

  return response;
}
