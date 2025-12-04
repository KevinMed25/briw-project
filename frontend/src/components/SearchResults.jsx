import React from 'react';

const SearchResults = ({ results, didYouMean, onSearch }) => {
    if (!results) return null;

    return (
        <div className="w-full">
            {didYouMean && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-800">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>
                        Did you mean:
                        <button
                            onClick={() => onSearch(didYouMean)}
                            className="font-semibold underline ml-1 hover:text-amber-900"
                        >
                            {didYouMean}
                        </button>?
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500 font-medium">
                    Found {results.total} results
                </p>
            </div>

            <div className="space-y-4">
                {results.results.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-blue-600 mb-1 group-hover:underline decoration-2 underline-offset-2">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: doc.title_hl || doc.title }} />
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <span className="truncate">{doc.url}</span>
                                </div>

                                <div className="text-slate-600 text-sm leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: doc.content_hl || doc.content }} />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                {doc.category}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                {doc.file_type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;
