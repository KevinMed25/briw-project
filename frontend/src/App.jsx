import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Facets from './components/Facets';
import UploadModal from './components/UploadModal';
import { search } from './services/api';

function App() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [currentQuery, setCurrentQuery] = useState('');

    const handleSearch = async (query, activeFilters = filters) => {
        setLoading(true);
        setCurrentQuery(query);
        try {
            const data = await search(query, activeFilters);
            setResults(data);
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (field, value) => {
        const newFilters = { ...filters };
        if (newFilters[field] === value) {
            delete newFilters[field]; // Toggle off
        } else {
            newFilters[field] = value; // Set new value
        }
        setFilters(newFilters);
        handleSearch(currentQuery, newFilters);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="absolute top-6 right-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                        Subir Documento
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
                        Buscador Inteligente
                    </h1>
                    <SearchBar onSearch={handleSearch} />
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex gap-8">
                    {results && results.facets && (
                        <Facets
                            facets={results.facets}
                            onFilter={handleFilter}
                            activeFilters={filters}
                        />
                    )}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : (
                            <SearchResults results={results} didYouMean={results?.didYouMean} onSearch={handleSearch} />
                        )}
                    </div>
                </div>
            </main>
            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
        </div>
    );
}

export default App;
