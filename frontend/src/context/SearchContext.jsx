import { createContext, useContext, useEffect, useRef, useState } from 'react';
import searchService from '../services/searchService';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await searchService.search(query.trim());
      setResults(data);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, isOpen, setIsOpen }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
