import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { useLanguage } from "../context/LanguageContext";
import Button from "./ui/Button";

export default function SearchAndFilter({
  onSearch,
  onFilter,
  onSort,
  type = "business",
  initialFilters = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [debounced, setDebounced] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    onSearch?.(debounced);
  }, [debounced]);
  useEffect(() => {
    onFilter?.(filters);
  }, [filters]);
  useEffect(() => {
    onSort?.(sortBy);
  }, [sortBy]);

  const handleFilterChange = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortBy("newest");
  };

  return (
    <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-card border border-border-light dark:border-border p-3 sm:p-4 mb-6 transition-all duration-200">
      <div className="flex flex-col md:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t("common.search")}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-light dark:bg-neutral-mid/20 border border-border-light dark:border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          size="md"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {t("common.filters")}
        </Button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 sm:px-4 py-2.5 bg-neutral-light dark:bg-neutral-mid/20 border border-border-light dark:border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition min-w-[120px]"
        >
          <option value="newest">{t("filters.newest")}</option>
          <option value="oldest">{t("filters.oldest")}</option>
          {type === "business" && (
            <option value="rating">{t("filters.highest_rated")}</option>
          )}
          <option value="name_asc">{t("filters.name_asc")}</option>
          <option value="name_desc">{t("filters.name_desc")}</option>
        </select>
      </div>
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-border-light dark:border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category filter (only for businesses) */}
            {type === "business" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  {t("business.category")}
                </label>
                  <select
                    value={filters.category || "all"}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-neutral-light dark:bg-neutral-mid/20 border border-border-light dark:border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none transition"
                  >
                  <option value="all">{t("business.all")}</option>
                  <option value="accommodation">
                    {t("business.accommodation")}
                  </option>
                  <option value="restaurant">{t("business.restaurant")}</option>
                  <option value="transport">{t("business.transport")}</option>
                  <option value="tours">{t("business.tours")}</option>
                </select>
              </div>
            )}

            {/* Type filter (only for destinations) */}
            {type === "destination" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Destination Type
                </label>
                  <select
                    value={filters.type || "all"}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-light dark:bg-neutral-mid/20 border border-border-light dark:border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none transition"
                  >
                  <option value="all">All Types</option>
                  <option value="cave">Cave</option>
                  <option value="mountain">Mountain</option>
                  <option value="pagoda">Pagoda</option>
                  <option value="lake">Lake</option>
                  <option value="waterfall">Waterfall</option>
                </select>
              </div>
            )}

            {/* Rating filter – for both businesses AND destinations */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                {t("filters.min_rating_label")}
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={filters.minRating || 0}
                  onRatingChange={(r) => handleFilterChange("minRating", r)}
                  size="md"
                />
                {filters.minRating > 0 && (
                  <button
                    onClick={() => handleFilterChange("minRating", 0)}
                    className="text-xs text-text-soft hover:text-error"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {t("common.clear")}
            </Button>
          </div>
        </div>
      )}
      {(searchTerm || Object.values(filters).some((v) => v && v !== "all")) && (
        <div className="mt-3 pt-3 border-t border-border-light dark:border-border flex flex-wrap gap-2">
          {searchTerm && (
            <FilterChip
              label={`${t("common.search")}: ${searchTerm}`}
              onRemove={() => setSearchTerm("")}
            />
          )}
          {filters.category && filters.category !== "all" && (
            <FilterChip
              label={`${t("business.category")}: ${filters.category}`}
              onRemove={() => handleFilterChange("category", "all")}
            />
          )}
          {filters.type && filters.type !== "all" && (
            <FilterChip
              label={`Type: ${filters.type}`}
              onRemove={() => handleFilterChange("type", "all")}
            />
          )}
          {filters.minRating > 0 && (
            <FilterChip
              label={`Rating: ${filters.minRating}+`}
              onRemove={() => handleFilterChange("minRating", 0)}
            />
          )}
        </div>
      )}
    </div>
  );
}

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-full text-sm">
    {label}
    <button onClick={onRemove} className="hover:text-error ml-0.5 font-bold leading-none">
      &times;
    </button>
  </span>
);