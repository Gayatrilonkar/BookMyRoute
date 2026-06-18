import React from 'react';
import { FaWifi, FaBolt, FaStar } from 'react-icons/fa';
import Badge from '../common/Badge';

export default function JourneyCard({ bus, onSelect, onReviewsClick }) {
  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    try {
      const [hours, minutes] = timeStr.slice(11, 16).split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes || '00'} ${ampm}`;
    } catch {
      return timeStr.slice(11, 16) || '--';
    }
  };

  const isAC = (bus.busType || '').includes('AC');
  const availableSeats = Number(bus.availableSeats) || 0;
  
  let seatBadgeVariant = 'success';
  if (availableSeats === 0) seatBadgeVariant = 'danger';
  else if (availableSeats <= 10) seatBadgeVariant = 'warning';

  const duration = bus.durationMins 
    ? `${Math.floor(bus.durationMins / 60)}h ${bus.durationMins % 60}m` 
    : 'Direct';

  const amenities = (bus.amenities || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div 
      className={`card-hover p-5 border-l-4 ${isAC ? 'border-l-accent' : 'border-l-gray-400'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-secondary">{bus.busName || 'Operator'}</h3>
          <Badge variant={isAC ? 'primary' : 'default'}>{bus.busType}</Badge>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-text-muted">Starting from</p>
          <p className="text-2xl font-bold font-mono text-primary">₹{bus.baseFare}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 relative">
        <div className="w-[120px]">
          <p className="text-xl font-bold text-secondary">{formatTime(bus.departureTime)}</p>
          <p className="text-sm text-text-muted font-medium truncate">{bus.origin}</p>
        </div>

        <div className="flex-1 px-4 flex flex-col items-center relative z-0">
          <div className="w-full h-[1px] bg-border-medium absolute top-1/2 -z-10"></div>
          <div className="w-2 h-2 rounded-full bg-primary absolute left-4 top-[calc(50%-4px)]"></div>
          <div className="w-2 h-2 rounded-full bg-primary absolute right-4 top-[calc(50%-4px)]"></div>
          
          <span className="bg-surface border border-border-light text-xs font-medium px-2 py-0.5 rounded-full text-text-muted z-10">
            {duration}
          </span>
        </div>

        <div className="w-[120px] text-right">
          <p className="text-xl font-bold text-secondary">{formatTime(bus.arrivalTime)}</p>
          <p className="text-sm text-text-muted font-medium truncate">{bus.destination}</p>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 pt-4 border-t border-border-light">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={seatBadgeVariant}>{availableSeats} seats left</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
              <FaStar />
              {bus.routeReviewCount ? `${Number(bus.routeAverageRating || 0).toFixed(1)} (${bus.routeReviewCount} Reviews)` : 'New route'}
            </span>
          </div>
          <div className="flex gap-2">
            {amenities.slice(0, 3).map(a => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {a === 'WiFi' && <FaWifi className="text-accent" />}
                {a === 'USB' && <FaBolt className="text-warning" />}
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            className="btn-primary whitespace-nowrap"
            onClick={(e) => { e.stopPropagation(); onSelect(bus); }}
          >
            Select seats
          </button>
          {bus.routeId && (
            <button
              onClick={(e) => { e.stopPropagation(); onReviewsClick(bus); }}
              className="text-xs font-bold text-text-muted hover:text-primary transition-colors underline underline-offset-2"
            >
              Route reviews
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
