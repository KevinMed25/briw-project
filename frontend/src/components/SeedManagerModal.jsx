import React, { useState, useEffect, useRef } from 'react';
import { getSeeds, updateSeeds, runCrawler, getCrawlerStatus } from '../services/api';

const SeedManagerModal = ({ isOpen, onClose }) => {
    const [seeds, setSeeds] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [crawling, setCrawling] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchSeeds();
            startPolling();
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [isOpen]);

    const startPolling = () => {
        checkStatus(); // Check immediately
        pollInterval.current = setInterval(checkStatus, 3000);
    };

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
    };

    const checkStatus = async () => {
        try {
            const status = await getCrawlerStatus();
            setCrawling(status.crawling);
            if (status.crawling === false && crawling === true) {
                // Just finished
                setSuccess('Crawling finished!');
                setTimeout(() => setSuccess(null), 5000);
            }
        } catch (err) {
            console.error("Failed to check crawler status", err);
        }
    };

    const fetchSeeds = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSeeds();
            setSeeds(data.join('\n'));
        } catch (err) {
            setError('Failed to load seeds.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const seedList = seeds.split('\n').map(s => s.trim()).filter(s => s);
            await updateSeeds(seedList);
            setSuccess('Seeds updated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to save seeds.');
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all seeds?')) {
            setSeeds('');
        }
    };

    const handleRunCrawler = async () => {
        try {
            setSaving(true); // Reuse saving state for button disable
            await runCrawler();
            setSuccess('Crawler started!');
            setCrawling(true); // Optimistic update
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to start crawler.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Manage Crawler Seeds
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Edit the list of URLs that the crawler will visit. One URL per line.
                                    </p>

                                    {loading ? (
                                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading seeds...</div>
                                    ) : (
                                        <textarea
                                            value={seeds}
                                            onChange={(e) => setSeeds(e.target.value)}
                                            rows={10}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="https://example.com"
                                            disabled={crawling}
                                        />
                                    )}

                                    {error && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                                    )}
                                    {success && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">{success}</p>
                                    )}
                                    {crawling && (
                                        <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Crawling in progress...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${saving || crawling ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={saving || loading || crawling}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${saving || crawling ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleRunCrawler}
                            disabled={saving || loading || crawling}
                        >
                            {crawling ? 'Crawling...' : 'Run Crawler'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleClear}
                            disabled={loading || crawling}
                        >
                            Clear All
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeedManagerModal;
