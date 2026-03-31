import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ItineraryCard from '../components/ItineraryCard';
import SearchAndFilter from '../components/SearchAndFilter';

export default function ItineraryList() {
  const [allItineraries, setAllItineraries] = useState([]);
  const [filteredItineraries, setFilteredItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchItineraries();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allItineraries, searchTerm, filters, sortBy]);

  const fetchItineraries = async () => {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .order('id');
    if (!error) {
      setAllItineraries(data);
    }
    setLoading(false);
  };

  const getDurationDays = (duration) => {
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const applyFiltersAndSearch = () => {
    let results = [...allItineraries];

    // Apply search
    if (searchTerm) {
      results = results.filter(itinerary =>
        itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply duration filter
    if (filters.duration && filters.duration !== 'all') {
      if (filters.duration === '3+') {
        results = results.filter(itinerary => getDurationDays(itinerary.duration) >= 3);
      } else {
        results = results.filter(itinerary => getDurationDays(itinerary.duration) === parseInt(filters.duration));
      }
    }

    // Apply sorting
    const sortFunctions = {
      newest: (a, b) => b.id - a.id,
      oldest: (a, b) => a.id - b.id,
      name_asc: (a, b) => a.title.localeCompare(b.title),
      name_desc: (a, b) => b.title.localeCompare(a.title),
      duration_asc: (a, b) => getDurationDays(a.duration) - getDurationDays(b.duration),
      duration_desc: (a, b) => getDurationDays(b.duration) - getDurationDays(a.duration),
    };

    if (sortFunctions[sortBy]) {
      results.sort(sortFunctions[sortBy]);
    }

    setFilteredItineraries(results);
  };

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">Travel Itineraries</h1>
      
      <SearchAndFilter
        type="itinerary"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItineraries.map(itinerary => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>

      {filteredItineraries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No itineraries found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({});
              setSortBy('newest');
            }}
            className="btn btn-primary mt-4"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}