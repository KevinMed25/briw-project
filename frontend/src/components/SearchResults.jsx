import React from 'react';

const SearchResults = ({ results, didYouMean, onSearch }) => {
    if (!results) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            {didYouMean && (
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                    <p>
                        ¿Quisiste decir:
                        <button
                            onClick={() => onSearch(didYouMean)}
                            className="ml-2 font-bold underline hover:text-yellow-800"
                        >
                            {didYouMean}
                        </button>?
                    </p>
                </div>
            )}

            <p className="text-sm text-gray-500 mb-4">Se encontraron {results.total} resultados</p>

            <div className="space-y-6">
                {results.results.map((doc) => (
                    <div key={doc.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-semibold text-blue-600 mb-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: doc.title_hl || doc.title }} />
                        </h3>
                        <div className="text-sm text-green-700 mb-2">{doc.url}</div>
                        <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: doc.content_hl || doc.content }} />
                        <div className="mt-2 flex gap-2">
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                                {doc.category}
                            </span>
                            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
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
