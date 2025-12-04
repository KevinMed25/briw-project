import React from 'react';

const Facets = ({ facets, onFilter, activeFilters }) => {
    if (!facets || Object.keys(facets).length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 transition-shadow duration-300 hover:shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </h3>
            <div className="space-y-6">
                {Object.entries(facets).map(([field, values]) => {
                    const pairs = [];
                    for (let i = 0; i < values.length; i += 2) {
                        pairs.push({ value: values[i], count: values[i + 1] });
                    }

                    if (pairs.length === 0) return null;

                    return (
                        <div key={field}>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                {field.replace('_', ' ')}
                            </h4>
                            <ul className="space-y-2">
                                {pairs.map((pair) => {
                                    const isActive = activeFilters && activeFilters[field] === pair.value;
                                    return (
                                        <li key={pair.value}>
                                            <button
                                                className={`flex items-center justify-between w-full text-sm px-2 py-1.5 rounded-md transition-colors ${isActive
                                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                                onClick={() => onFilter(field, pair.value)}
                                            >
                                                <span className="truncate">{pair.value}</span>
                                                <span className={`text-xs ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
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
        </div>
    );
};

export default Facets;
