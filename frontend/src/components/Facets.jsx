import React from 'react';

const Facets = ({ facets, onFilter, activeFilters }) => {
    if (!facets || Object.keys(facets).length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-gray-700 p-5 transition-shadow duration-300 hover:shadow-xl dark:hover:bg-gray-750">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
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
                            <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {field.replace('_', ' ')}
                            </h4>
                            <ul className="space-y-2">
                                {pairs.map((pair) => {
                                    const isActive = activeFilters && activeFilters[field] === pair.value;
                                    return (
                                        <li key={pair.value}>
                                            <button
                                                className={`flex items-center justify-between w-full text-sm px-2 py-1.5 rounded-md transition-colors ${isActive
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                                    : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                onClick={() => onFilter(field, pair.value)}
                                            >
                                                <span className="truncate">{pair.value}</span>
                                                <span className={`text-xs ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>
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
