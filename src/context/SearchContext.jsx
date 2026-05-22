import { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SearchContext = createContext();

export function SearchProvider({ children }) {
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Automatically clear the search bar whenever the user changes pages!
    useEffect(() => {
        setSearchQuery('');
    }, [location.pathname]);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
}