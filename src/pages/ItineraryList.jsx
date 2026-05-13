import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ItineraryCard from "../components/ItineraryCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import SearchAndFilter from "../components/SearchAndFilter";
import { useLanguage } from "../context/LanguageContext";
import WeatherWidget from "../components/WeatherWidget";
import UpcomingEventsWidget from "../components/UpcomingEventsWidget";

export default function ItineraryList() {
  const [itineraries, setItineraries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [itineraries, searchTerm, filters, sortBy]);

  const fetchItineraries = async () => {
    const { data, error } = await supabase
      .from("itineraries")
      .select("*")
      .order("id");
    if (!error) setItineraries(data);
    setLoading(false);
  };

  const getDurationDays = (duration) => {
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const applyFiltersAndSearch = () => {
    let results = [...itineraries];
    if (searchTerm) {
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filters.duration && filters.duration !== "all") {
      if (filters.duration === "3+")
        results = results.filter((i) => getDurationDays(i.duration) >= 3);
      else
        results = results.filter(
          (i) => getDurationDays(i.duration) === parseInt(filters.duration),
        );
    }
    const sorts = {
      newest: (a, b) => b.id - a.id,
      oldest: (a, b) => a.id - b.id,
      name_asc: (a, b) => a.title.localeCompare(b.title),
      name_desc: (a, b) => b.title.localeCompare(a.title),
      duration_asc: (a, b) =>
        getDurationDays(a.duration) - getDurationDays(b.duration),
      duration_desc: (a, b) =>
        getDurationDays(b.duration) - getDurationDays(a.duration),
    };
    if (sorts[sortBy]) results.sort(sorts[sortBy]);
    setFiltered(results);
  };

  if (loading) {
    return (
      <div className="container-custom">
        <h1 className="page-title">{t("home.title")}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">Upcomming Events</h1>
      <div className="mb-8">
        <UpcomingEventsWidget />
      </div>
      <h1 className="page-title">Weather</h1>
      <div className="mb-8">
        <WeatherWidget />
      </div>
      <h1 className="page-title">{t("home.title")}</h1>
      <SearchAndFilter
        type="itinerary"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-soft">{t("common.no_results")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((itinerary) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} />
          ))}
        </div>
      )}
    </div>
  );
}
