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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            SolariSearch
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Document
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Left Column: Filters (3 cols) */}
                    <div className="col-span-12 lg:col-span-3">
                        {results && results.facets && (
                            <aside className="sticky top-24">
                                <Facets
                                    facets={results.facets}
                                    onFilter={handleFilter}
                                    activeFilters={filters}
                                />
                            </aside>
                        )}
                    </div>

                    {/* Center Column: Search & Results (6 cols) */}
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-8">
                        <SearchBar onSearch={handleSearch} />

                        <section className="min-w-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <svg className="animate-spin h-8 w-8 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-medium">Searching documents...</p>
                                </div>
                            ) : (
                                <SearchResults results={results} didYouMean={results?.didYouMean} onSearch={handleSearch} />
                            )}
                        </section>
                    </div>

                    {/* Right Column: Spacer (3 cols) */}
                    <div className="hidden lg:block lg:col-span-3">
                        {/* Empty spacer to balance the grid and keep center column perfectly centered */}
                    </div>
                </div>
            </main>

            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
        </div>
    );
}

export default App;
