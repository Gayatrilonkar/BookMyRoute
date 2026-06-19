import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useSearchStore = create(
  persist(
    (set) => ({
      searchForm: {
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0],
      },
      searchResults: null,
      sortBy: 'price', // options: price, price_desc, duration, duration_desc, departure, arrival, seats
      filters: {
        busTypes: [],
        amenities: [],
        fareRange: [0, 50000], // [min, max]
        durationSlots: [], // e.g., '< 4h', '4-8h', '8-12h', '> 12h'
        departureSlots: [], // e.g., 'Early Morning', 'Morning', 'Afternoon', 'Evening'
        availableSeatsOnly: false
      },
      setSearchForm: (form) => set({ searchForm: form }),
      setSearchResults: (results) => set((state) => ({ 
        searchResults: results,
        // Optional: We can leave filters as is so they persist across date changes,
        // or reset them. The bug fix already ensures they can be cleared.
      })),
      setSortBy: (sortBy) => set({ sortBy }),
      setFilters: (filtersOrUpdater) => set((state) => ({ 
        filters: typeof filtersOrUpdater === 'function' ? filtersOrUpdater(state.filters) : { ...state.filters, ...filtersOrUpdater } 
      })),
      resetSearch: () => set({
        searchForm: { from: '', to: '', date: new Date().toISOString().split('T')[0] },
        searchResults: null,
        sortBy: 'price',
        filters: { busTypes: [], amenities: [], fareRange: [0, 50000], durationSlots: [], departureSlots: [], availableSeatsOnly: false }
      }),
    }),
    {
      name: 'bus-search-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
