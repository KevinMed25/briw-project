import React from 'react';

const Facets = ({ facets, onFilter, activeFilters }) => {
    if (!facets || Object.keys(facets).length === 0) return null;

    return (
        <div className="w-64 flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            {Object.entries(facets).map(([field, values]) => {
                // Solr returns facets as a flat array [val1, count1, val2, count2...]
                // We need to pair them up
                const pairs = [];
                for (let i = 0; i < values.length; i += 2) {
                    pairs.push({ value: values[i], count: values[i + 1] });
                }

                if (pairs.length === 0) return null;

                return (
                    <div key={field} className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2 capitalize">{field.replace('_', ' ')}</h4>
                        <ul className="space-y-1">
                            {pairs.map((pair) => {
                                const isActive = activeFilters && activeFilters[field] === pair.value;
                                return (
                                    <li key={pair.value}>
                                        <button
                                            className={`flex items-center justify-between w-full text-sm hover:text-blue-600 ${isActive ? 'font-bold text-blue-700' : 'text-gray-600'}`}
                                            onClick={() => onFilter(field, pair.value)}
                                        >
                                            <span>{pair.value}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {pair.count}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

export default Facets;
