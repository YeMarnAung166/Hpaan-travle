import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { motion as Motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  subDays, subYears, format,
} from 'date-fns';
import {
  MapPin, Store, Calendar, Star, Camera, CalendarCheck,
  TrendingUp, TrendingDown, PlusCircle, ClipboardList,
} from 'lucide-react';

function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const increment = Math.ceil(value / (duration * 60));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}

const GRADIENTS = {
  destinations: 'from-emerald-600 to-teal-500',
  businesses: 'from-blue-600 to-indigo-500',
  events: 'from-amber-500 to-orange-500',
  reviews: 'from-purple-600 to-pink-500',
  pendingPhotos: 'from-rose-500 to-red-500',
  bookings: 'from-cyan-600 to-sky-500',
};

const ICONS = {
  destinations: MapPin,
  businesses: Store,
  events: Calendar,
  reviews: Star,
  pendingPhotos: Camera,
  bookings: CalendarCheck,
};

function StatCard({ title, value, link, icon, gradient, trend, trendLabel, index }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={link}
        className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white block group hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300`}
      >
        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity">
          {icon}
        </div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold font-serif">
            <AnimatedCounter value={value} />
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-xs text-white/70">
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend)}%</span>
              <span className="text-white/50 ml-1">{trendLabel}</span>
            </div>
          )}
        </div>
      </Link>
    </Motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-neutral-dark border border-border rounded-xl shadow-elevated p-3 text-sm">
      <p className="font-semibold text-text mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const CHART_COLORS = {
  pending: '#F0B84A',
  confirmed: '#4CAF8A',
  rejected: '#F87171',
  destinations: '#2D5A5A',
  businesses: '#4F6F8F',
};

function monthKey(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return format(date, 'MMM yyyy');
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ destinations: 0, businesses: 0, events: 0, reviews: 0, pendingPhotos: 0, bookings: 0 });
  const [bookingsTrend, setBookingsTrend] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dateRange, setDateRange] = useState('30d');

  const startDate = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case '1y': return subYears(now, 1);
      default: return null;
    }
  }, [dateRange]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [
        { count: dCount },
        { count: bCount },
        { count: eCount },
        { count: rCount },
        { count: pCount },
      ] = await Promise.all([
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('business_reviews').select('*', { count: 'exact', head: true }),
        supabase.from('user_photos').select('*', { count: 'exact', head: true }).eq('moderated', false),
      ]);

      const { count: bkCount } = await supabase
        .from('bookings').select('*', { count: 'exact', head: true });

      setStats({
        destinations: dCount || 0, businesses: bCount || 0, events: eCount || 0,
        reviews: rCount || 0, pendingPhotos: pCount || 0, bookings: bkCount || 0,
        _trends: {},
      });

      const { data: allBk } = await supabase
        .from('bookings').select('created_at, status');
      const { data: allBiz } = await supabase
        .from('businesses').select('*').order('id');
      const { data: allDests } = await supabase
        .from('destinations').select('*').order('id');

      if (allBk) {
        const monthlyMap = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = format(d, 'MMM yyyy');
          monthlyMap[key] = { month: key, pending: 0, confirmed: 0, rejected: 0 };
        }
        allBk.forEach(b => {
          const key = monthKey(b.created_at);
          if (key && monthlyMap[key]) monthlyMap[key][b.status || 'pending'] += 1;
        });
        setBookingsTrend(Object.values(monthlyMap));
      }

      if (allBiz && allDests) {
        const growthMap = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = format(d, 'MMM yyyy');
          growthMap[key] = { month: key, destinations: 0, businesses: 0 };
        }
        allDests.forEach(d => {
          const key = monthKey(d.created_at);
          if (key && growthMap[key]) growthMap[key].destinations += 1;
        });
        allBiz.forEach(b => {
          const key = monthKey(b.created_at);
          if (key && growthMap[key]) growthMap[key].businesses += 1;
        });
        let cumD = 0, cumB = 0;
        const cumulative = Object.values(growthMap).map(g => {
          cumD += g.destinations;
          cumB += g.businesses;
          return { ...g, destinations: cumD, businesses: cumB };
        });
        setGrowthData(cumulative);
      }

      const { data: topBiz } = await supabase
        .from('businesses')
        .select('id, name, name_my, avg_rating, review_count')
        .gt('avg_rating', 0)
        .order('avg_rating', { ascending: false })
        .limit(5);
      setTopBusinesses(topBiz || []);

      const { data: recentBk } = await supabase
        .from('bookings').select('id, name, created_at').order('created_at', { ascending: false }).limit(5);
      const { data: recentRev } = await supabase
        .from('business_reviews').select('id, user_email, created_at').order('created_at', { ascending: false }).limit(5);
      const { data: recentPhotos } = await supabase
        .from('user_photos').select('id, user_email, created_at').order('created_at', { ascending: false }).limit(5);

      const activity = [];
      (recentBk || []).forEach(b => activity.push({ id: `bk-${b.id}`, type: 'booking', text: b.name, time: b.created_at }));
      (recentRev || []).forEach(r => activity.push({ id: `rv-${r.id}`, type: 'review', text: r.user_email || 'Someone', time: r.created_at }));
      (recentPhotos || []).forEach(p => activity.push({ id: `ph-${p.id}`, type: 'photo', text: p.user_email || '', time: p.created_at }));
      activity.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activity.slice(0, 10));
      setLoading(false);
    };
    fetchAll();
  }, [dateRange, startDate, t]);

  const trends = stats._trends || {};

  const renderIcon = (IconCmp) => <IconCmp size={48} strokeWidth={1.5} />; // eslint-disable-line no-unused-vars

  const statCards = [
    { key: 'destinations', title: t('admin.destinations'), value: stats.destinations, link: '/admin/destinations', gradient: GRADIENTS.destinations, icon: renderIcon(ICONS.destinations), trend: trends.destinations },
    { key: 'businesses', title: t('admin.businesses'), value: stats.businesses, link: '/admin/businesses', gradient: GRADIENTS.businesses, icon: renderIcon(ICONS.businesses), trend: trends.businesses },
    { key: 'events', title: t('admin.events'), value: stats.events, link: '/admin/events', gradient: GRADIENTS.events, icon: renderIcon(ICONS.events), trend: trends.events },
    { key: 'reviews', title: t('admin.reviews'), value: stats.reviews, link: '/admin/reviews', gradient: GRADIENTS.reviews, icon: renderIcon(ICONS.reviews), trend: trends.reviews },
    { key: 'pendingPhotos', title: t('admin.pending_photos'), value: stats.pendingPhotos, link: '/admin/user-photos', gradient: GRADIENTS.pendingPhotos, icon: renderIcon(ICONS.pendingPhotos), trend: trends.pendingPhotos },
    { key: 'bookings', title: t('admin.total_bookings'), value: stats.bookings, link: '/admin/bookings', gradient: GRADIENTS.bookings, icon: renderIcon(ICONS.bookings), trend: trends.bookings },
  ];

  const dateFilters = [
    { key: '7d', label: t('admin.last_7d') },
    { key: '30d', label: t('admin.last_30d') },
    { key: '90d', label: t('admin.last_90d') },
    { key: '1y', label: t('admin.last_1y') },
    { key: 'all', label: t('admin.all_time') },
  ];

  if (loading) {
    return (
      <div>
        <Helmet>
          <title>Admin Dashboard | Hpa-An Travel</title>
          <meta name="description" content="Admin dashboard for Hpa-An Travel" />
          <meta property="og:title" content="Admin Dashboard" />
          <meta property="og:description" content="Admin dashboard for Hpa-An Travel" />
          <meta property="og:type" content="website" />
        </Helmet>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('admin.dashboard')}</h2>
        </div>
        <SkeletonStatCard count={6} />
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Helmet>
        <title>Admin Dashboard | Hpa-An Travel</title>
        <meta name="description" content="Analytics and management dashboard for Hpa-An Travel" />
        <meta property="og:title" content="Admin Dashboard" />
        <meta property="og:description" content="Analytics and management dashboard" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">{t('admin.dashboard')}</h2>
        <div className="flex gap-1 bg-neutral-light dark:bg-neutral-dark rounded-xl p-1 border border-border">
          {dateFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setDateRange(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                dateRange === f.key
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-soft hover:text-text hover:bg-white/50 dark:hover:bg-neutral-mid/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard key={card.key} {...card} index={i} trendLabel={t('admin.vs_last_period')} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Motion.div
          className="bg-white dark:bg-neutral-dark rounded-2xl border border-border shadow-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CalendarCheck size={20} className="text-primary" />
            {t('admin.monthly_bookings')}
          </h3>
          {bookingsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingsTrend} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-soft)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-soft)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pending" name="Pending" fill={CHART_COLORS.pending} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="confirmed" name="Confirmed" fill={CHART_COLORS.confirmed} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rejected" name="Rejected" fill={CHART_COLORS.rejected} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-text-soft">{t('admin.no_data_chart')}</div>
          )}
        </Motion.div>

        <Motion.div
          className="bg-white dark:bg-neutral-dark rounded-2xl border border-border shadow-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            {t('admin.content_growth')}
          </h3>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="gradDest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.destinations} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.destinations} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBiz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.businesses} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.businesses} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-soft)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-soft)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="destinations" name="Destinations" stroke={CHART_COLORS.destinations} fill="url(#gradDest)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="businesses" name="Businesses" stroke={CHART_COLORS.businesses} fill="url(#gradBiz)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-text-soft">{t('admin.no_data_chart')}</div>
          )}
        </Motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Motion.div
          className="bg-white dark:bg-neutral-dark rounded-2xl border border-border shadow-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-gold" />
            {t('admin.top_rated')}
          </h3>
          {topBusinesses.length > 0 ? (
            <div className="space-y-3">
              {topBusinesses.map((biz, i) => (
                <Link
                  key={biz.id}
                  to="/admin/businesses"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-overlay transition group"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{biz.name}</p>
                    <div className="flex items-center gap-2 text-xs text-text-soft">
                      <span className="flex items-center gap-0.5">
                        <Star size={11} className="text-gold fill-gold" />
                        {biz.avg_rating ? Number(biz.avg_rating).toFixed(1) : '-'}
                      </span>
                      <span>{biz.review_count ?? 0} {t('admin.reviews_count_label')}</span>
                    </div>
                  </div>
                  <TrendingUp size={16} className="text-text-soft group-hover:text-primary transition" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-soft text-sm py-8 text-center">{t('admin.no_data_chart')}</p>
          )}
        </Motion.div>

        <Motion.div
          className="bg-white dark:bg-neutral-dark rounded-2xl border border-border shadow-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-primary" />
            {t('admin.recent_activity')}
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-0">
              {recentActivity.map((act, i) => (
                <div key={act.id} className={`flex items-center gap-3 py-2.5 ${i < recentActivity.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    act.type === 'booking' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' :
                    act.type === 'review' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                  }`}>
                    {act.type === 'booking' ? <CalendarCheck size={15} /> :
                     act.type === 'review' ? <Star size={15} /> : <Camera size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">
                      {act.type === 'booking' ? `${t('admin.new_booking')} ${act.text}` :
                       act.type === 'review' ? `${t('admin.new_review')} ${act.text}` :
                       t('admin.new_photo')}
                    </p>
                    <p className="text-xs text-text-soft">{format(new Date(act.time), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-soft text-sm py-8 text-center">{t('admin.no_data_chart')}</p>
          )}
        </Motion.div>

        <Motion.div
          className="bg-white dark:bg-neutral-dark rounded-2xl border border-border shadow-soft p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-primary" />
            {t('admin.quick_actions')}
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/destinations"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-gold/30 hover:shadow-soft hover:-translate-y-0.5 transition-all bg-neutral-light/50 dark:bg-neutral-mid/20"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{t('admin.add_destination')}</p>
                <p className="text-xs text-text-soft">{t('admin.destinations')}</p>
              </div>
            </Link>
            <Link
              to="/admin/businesses"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-gold/30 hover:shadow-soft hover:-translate-y-0.5 transition-all bg-neutral-light/50 dark:bg-neutral-mid/20"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <Store size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{t('admin.add_business')}</p>
                <p className="text-xs text-text-soft">{t('admin.businesses')}</p>
              </div>
            </Link>
            <Link
              to="/admin/user-photos"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-gold/30 hover:shadow-soft hover:-translate-y-0.5 transition-all bg-neutral-light/50 dark:bg-neutral-mid/20"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{t('admin.moderate_photos_action')}</p>
                <p className="text-xs text-text-soft">{stats.pendingPhotos} {t('admin.pending_photos')}</p>
              </div>
            </Link>
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
