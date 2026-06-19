import React from 'react';
import { useSearchStore } from '../../store/useSearchStore';

export default function SortDropdown() {
  const { sortBy, setSortBy } = useSearchStore();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-dropdown" className="text-sm font-bold text-text-muted whitespace-nowrap">Sort by:</label>
      <select 
        id="sort-dropdown"
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        className="input-field py-1.5 px-3 text-sm font-medium border-border-medium bg-surface text-secondary w-auto pr-8"
      >
        <option value="price">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="duration">Fastest Journey</option>
        <option value="duration_desc">Longest Journey</option>
        <option value="departure">Earliest Departure</option>
        <option value="departure_desc">Latest Departure</option>
        <option value="arrival">Earliest Arrival</option>
        <option value="arrival_desc">Latest Arrival</option>
        <option value="seats">Most Available Seats</option>
      </select>
    </div>
  );
}
