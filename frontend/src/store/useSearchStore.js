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
      sortBy: 'price',
      setSearchForm: (form) => set({ searchForm: form }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSortBy: (sortBy) => set({ sortBy }),
      resetSearch: () => set({
        searchForm: { from: '', to: '', date: new Date().toISOString().split('T')[0] },
        searchResults: null,
        sortBy: 'price'
      }),
    }),
    {
      name: 'bus-search-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
