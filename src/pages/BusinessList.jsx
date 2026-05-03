import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BusinessCard from "../components/BusinessCard";
import SearchAndFilter from "../components/SearchAndFilter";
import { useLanguage } from "../context/LanguageContext";

export default function BusinessList() {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");
  const { t } = useLanguage();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allBusinesses, searchTerm, filters, sortBy]);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("id");
    if (!error) {
      setAllBusinesses(data);
    }
    setLoading(false);
  };

  const fetchRatings = async (businessIds) => {
    const { data, error } = await supabase
      .from("business_reviews")
      .select("business_id, rating")
      .in("business_id", businessIds);

    if (error) return {};

    const ratingsMap = {};
    data.forEach((review) => {
      if (!ratingsMap[review.business_id]) {
        ratingsMap[review.business_id] = { sum: 0, count: 0 };
      }
      ratingsMap[review.business_id].sum += review.rating;
      ratingsMap[review.business_id].count += 1;
    });

    const avgRatings = {};
    Object.keys(ratingsMap).forEach((id) => {
      avgRatings[id] = ratingsMap[id].sum / ratingsMap[id].count;
    });

    return avgRatings;
  };

  const applyFiltersAndSearch = async () => {
    let results = [...allBusinesses];

    // Apply search
    if (searchTerm) {
      results = results.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.name_my?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          business.description_my
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          business.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address_my?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      results = results.filter(
        (business) => business.category === filters.category,
      );
    }

    // Apply rating filter
    if (filters.minRating > 0) {
      const businessIds = results.map((b) => b.id);
      const ratings = await fetchRatings(businessIds);
      results = results.filter(
        (business) => (ratings[business.id] || 0) >= filters.minRating,
      );
    }

    // Apply sorting
    const sortFunctions = {
      newest: (a, b) => b.id - a.id,
      oldest: (a, b) => a.id - b.id,
      name_asc: (a, b) => a.name.localeCompare(b.name),
      name_desc: (a, b) => b.name.localeCompare(a.name),
      rating: async (a, b) => {
        const ratings = await fetchRatings([a.id, b.id]);
        return (ratings[b.id] || 0) - (ratings[a.id] || 0);
      },
    };

    if (sortBy === "rating") {
      const ratings = await fetchRatings(results.map((r) => r.id));
      results.sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0));
    } else if (sortFunctions[sortBy]) {
      results.sort(sortFunctions[sortBy]);
    }

    setFilteredBusinesses(results);
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
      <h1 className="page-title">{t("business.title")}</h1>

      <SearchAndFilter
        type="business"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("common.no_results")}</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilters({});
              setSortBy("newest");
            }}
            className="btn btn-primary mt-4"
          >
            {t("common.clear")}
          </button>
        </div>
      )}
    </div>
  );
}
