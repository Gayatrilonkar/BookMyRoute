import React, { useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useSearchStore } from '../../store/useSearchStore';

export default function SearchFilters({ rawResults = [], onCloseMobile }) {
  const { filters, setFilters } = useSearchStore();

  // Extract dynamic options from results
  const availableBusTypes = useMemo(() => {
    const types = new Set();
    rawResults.forEach(b => {
      if (b.busType) b.busType.split(',').forEach(t => types.add(t.trim()));
    });
    return Array.from(types).sort();
  }, [rawResults]);

  const availableAmenities = useMemo(() => {
    const am = new Set();
    rawResults.forEach(b => {
      if (b.amenities) b.amenities.split(',').forEach(a => am.add(a.trim()));
    });
    return Array.from(am).sort();
  }, [rawResults]);

  const maxFareOverall = useMemo(() => {
    if (!rawResults.length) return 50000;
    return Math.max(...rawResults.map(b => b.baseFare || 0), 1000); // ensure at least 1000
  }, [rawResults]);

  const toggleArrayItem = (key, value) => {
    const curr = filters[key] || [];
    const next = curr.includes(value) ? curr.filter(i => i !== value) : [...curr, value];
    setFilters({ [key]: next });
  };

  return (
    <div className="flex flex-col h-full bg-white sm:bg-transparent">
      <div className="flex items-center justify-between p-4 border-b border-border-light sm:hidden bg-secondary text-white">
        <h2 className="text-lg font-bold">Filters</h2>
        <button onClick={onCloseMobile} className="p-2 -mr-2 bg-white/10 rounded-lg hover:bg-white/20">
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Seat Availability */}
        <section>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-primary rounded border-border-medium"
              checked={filters.availableSeatsOnly}
              onChange={(e) => setFilters({ availableSeatsOnly: e.target.checked })}
            />
            <span className="font-bold text-secondary">Hide fully booked buses</span>
          </label>
        </section>

        <hr className="border-border-light" />

        {/* Departure Time */}
        <section>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3">Departure Time</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Early Morning', label: 'Before 6 AM' },
              { id: 'Morning', label: '6 AM - 12 PM' },
              { id: 'Afternoon', label: '12 PM - 6 PM' },
              { id: 'Evening', label: 'After 6 PM' }
            ].map(slot => (
              <label key={slot.id} className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${filters.departureSlots.includes(slot.id) ? 'border-primary bg-primary/5 text-primary' : 'border-border-light text-text-muted hover:border-border-medium'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={filters.departureSlots.includes(slot.id)}
                  onChange={() => toggleArrayItem('departureSlots', slot.id)}
                />
                <span className="text-center leading-tight">{slot.id}</span>
                <span className="text-[10px] opacity-70 mt-1">{slot.label}</span>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-border-light" />

        {/* Fare Range */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-muted">Fare Range</h3>
            <span className="text-sm font-bold text-secondary">Up to ₹{filters.fareRange[1]}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={maxFareOverall} 
            step="100"
            value={filters.fareRange[1] > maxFareOverall ? maxFareOverall : filters.fareRange[1]}
            onChange={(e) => setFilters({ fareRange: [0, parseInt(e.target.value)] })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1 font-medium">
            <span>₹0</span>
            <span>₹{maxFareOverall}</span>
          </div>
        </section>

        <hr className="border-border-light" />

        {/* Bus Types */}
        {availableBusTypes.length > 0 && (
          <section>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3">Bus Type</h3>
            <div className="space-y-2">
              {availableBusTypes.map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary rounded border-border-medium"
                    checked={filters.busTypes.includes(type)}
                    onChange={() => toggleArrayItem('busTypes', type)}
                  />
                  <span className="text-[15px] font-medium text-secondary group-hover:text-primary transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {availableBusTypes.length > 0 && <hr className="border-border-light" />}

        {/* Amenities */}
        {availableAmenities.length > 0 && (
          <section>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3">Amenities</h3>
            <div className="space-y-2">
              {availableAmenities.map(amenity => (
                <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary rounded border-border-medium"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => toggleArrayItem('amenities', amenity)}
                  />
                  <span className="text-[15px] font-medium text-secondary group-hover:text-primary transition-colors">{amenity}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <hr className="border-border-light" />

        {/* Duration */}
        <section>
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-3">Journey Duration</h3>
          <div className="space-y-2">
            {[
              { id: '< 4h', label: 'Less than 4 hours' },
              { id: '4-8h', label: '4 to 8 hours' },
              { id: '8-12h', label: '8 to 12 hours' },
              { id: '> 12h', label: 'More than 12 hours' }
            ].map(slot => (
              <label key={slot.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-primary rounded border-border-medium"
                  checked={filters.durationSlots.includes(slot.id)}
                  onChange={() => toggleArrayItem('durationSlots', slot.id)}
                />
                <span className="text-[15px] font-medium text-secondary group-hover:text-primary transition-colors">{slot.label}</span>
              </label>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
