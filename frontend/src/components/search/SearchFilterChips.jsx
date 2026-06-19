import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useSearchStore } from '../../store/useSearchStore';

export default function SearchFilterChips() {
  const { filters, setFilters } = useSearchStore();

  const removeArrayItem = (key, value) => {
    setFilters({ [key]: filters[key].filter(i => i !== value) });
  };

  const chips = [];

  if (filters.availableSeatsOnly) {
    chips.push({ key: 'availableSeatsOnly', label: 'Available seats only', onRemove: () => setFilters({ availableSeatsOnly: false }) });
  }

  filters.busTypes.forEach(t => {
    chips.push({ key: `type-${t}`, label: t, onRemove: () => removeArrayItem('busTypes', t) });
  });

  filters.amenities.forEach(a => {
    chips.push({ key: `amenity-${a}`, label: a, onRemove: () => removeArrayItem('amenities', a) });
  });

  filters.departureSlots.forEach(s => {
    chips.push({ key: `dep-${s}`, label: `${s} Departure`, onRemove: () => removeArrayItem('departureSlots', s) });
  });

  filters.durationSlots.forEach(d => {
    chips.push({ key: `dur-${d}`, label: `Duration: ${d}`, onRemove: () => removeArrayItem('durationSlots', d) });
  });

  if (filters.fareRange[1] < 50000) {
    chips.push({ key: 'fare', label: `Under ₹${filters.fareRange[1]}`, onRemove: () => setFilters({ fareRange: [0, 50000] }) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-bold text-text-muted mr-1">Active filters:</span>
      {chips.map(chip => (
        <span key={chip.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-primary-dark hover:bg-primary/20 rounded-full p-0.5 transition-colors">
            <FaTimes className="text-[10px]" />
          </button>
        </span>
      ))}
      <button 
        onClick={() => setFilters({ busTypes: [], amenities: [], fareRange: [0, 50000], durationSlots: [], departureSlots: [], availableSeatsOnly: false })}
        className="text-sm font-bold text-text-muted hover:text-error underline underline-offset-2 ml-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
