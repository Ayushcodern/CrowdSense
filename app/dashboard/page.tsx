'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Map from '@/components/Map';
import { RefreshCcw, Activity, Map as MapIcon, Filter, Layers, ChevronRight, CheckCircle, X, Settings as SettingsIcon, Moon, Sun, Archive } from 'lucide-react';

export default function DashboardPage() {
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState<any>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
    const [mapZoom, setMapZoom] = useState(5);

    // New Features State
    const [filterStatus, setFilterStatus] = useState<'active' | 'resolved'>('active');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize Theme
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const fetchClusters = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clusters?status=${filterStatus}`);
            const data = await res.json();
            setClusters(data.clusters || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when filter changes
    useEffect(() => {
        fetchClusters();
    }, [filterStatus]);

    const resolveCluster = async (id: string) => {
        if (!confirm('Are you sure you want to resolve this issue?')) return;
        try {
            await fetch(`/api/clusters/${id}`, { method: 'PATCH' });
            fetchClusters();
        } catch (e) {
            console.error(e);
            alert('Failed to resolve');
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchClusters, 30000);
        return () => clearInterval(interval);
    }, [filterStatus]);

    const totalIssues = clusters.filter(c => filterStatus === 'active' ? true : true).length; // Just count current list
    const criticalIssues = clusters.filter((c: any) => c.priorityScore > 100).length;

    const getClusterImage = (cluster: any) => {
        if (cluster.reportIds && cluster.reportIds.length > 0) {
            const reportWithImage = cluster.reportIds.find((r: any) => r.imageUrl);
            return reportWithImage ? reportWithImage.imageUrl : null;
        }
        return null;
    };

    const getClusterDescription = (cluster: any) => {
        if (cluster.reportIds && cluster.reportIds.length > 0) {
            return cluster.reportIds[0].description || 'No description provided.';
        }
        return 'No details available.';
    };

    return (
        <div className={`min-h-screen flex flex-col h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100 selection:bg-blue-500/30' : 'bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900'}`}>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className={`rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-8 relative ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <SettingsIcon className="w-6 h-6" /> Settings
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                        {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-bold">Dark Mode</div>
                                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Switch app appearance
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <hr className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`} />

                            <div className={`text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                CrowdSense Admin v1.0.0
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedCluster && (
                <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 relative ${isDarkMode ? 'bg-slate-900 ring-1 ring-white/10' : 'bg-white ring-1 ring-black/5'}`}>
                        <div className="relative h-64 bg-slate-800 group">
                            {getClusterImage(selectedCluster) ? (
                                <img src={getClusterImage(selectedCluster)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Issue" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <MapIcon className="w-12 h-12 opacity-20" />
                                    <span className="text-xs font-medium opacity-50 uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedCluster(null)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <h3 className="absolute bottom-6 left-6 text-3xl font-bold text-white capitalize drop-shadow-md">
                                {selectedCluster.issueType}
                            </h3>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedCluster.priorityScore > 100
                                        ? (isDarkMode ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-red-50 text-red-600 ring-1 ring-red-100')
                                        : (isDarkMode ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-green-50 text-green-600 ring-1 ring-green-100')
                                    }`}>
                                    Score: {Math.round(selectedCluster.priorityScore)}
                                </span>
                                <span className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Activity className="w-4 h-4" /> {selectedCluster.reportCount} Reports
                                </span>
                            </div>

                            <div className="mb-8">
                                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Description</h4>
                                <p className={`leading-relaxed text-sm p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                    {getClusterDescription(selectedCluster)}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {filterStatus !== 'resolved' && (
                                    <button
                                        onClick={() => { resolveCluster(selectedCluster._id); setSelectedCluster(null); }}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Resolve
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedCluster(null)}
                                    className={`flex-1 py-4 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div className={`h-20 backdrop-blur-md border-b flex items-center px-8 justify-between shrink-0 sticky top-0 z-30 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className={`font-bold text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            CrowdSense <span className={`font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Admin</span>
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={fetchClusters}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
                    </button>
                </div>
            </div>

            <div className={`flex-1 flex flex-col md:flex-row overflow-hidden relative ${isDarkMode ? 'bg-black' : 'bg-slate-100'}`}>

                {/* Sidebar */}
                <div className={`w-full md:w-[450px] backdrop-blur-xl border-r flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-1/2 md:h-auto order-2 md:order-1 relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-200/60'}`}>

                    {/* Status Toggle */}
                    <div className={`p-6 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-100'}`}>
                        <div className={`p-1 rounded-xl flex ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200/50'}`}>
                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filterStatus === 'active'
                                    ? (isDarkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-white text-blue-600 shadow-sm')
                                    : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterStatus('resolved')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filterStatus === 'resolved'
                                    ? (isDarkMode ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-white text-green-600 shadow-sm')
                                    : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                        {loading && clusters.length === 0 ? (
                            <div className="flex justify-center p-8"><span className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></span></div>
                        ) : clusters.length === 0 ? (
                            <div className={`text-center p-8 flex flex-col items-center opacity-50 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                <div className="p-4 rounded-full bg-slate-100/5 mb-4"><Archive className="w-8 h-8" /></div>
                                <span className="text-sm font-medium">No {filterStatus} reports found</span>
                            </div>
                        ) : (
                            clusters.map((cluster: any, idx) => (
                                <div
                                    key={cluster._id}
                                    className={`group p-5 rounded-[1.25rem] border hover:border-blue-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-default animate-in slide-in-from-bottom-4 fill-mode-backwards ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-transparent'
                                        }`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${cluster.priorityScore > 100 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                            <h3 className={`font-bold capitalize text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cluster.issueType}</h3>
                                        </div>
                                        {filterStatus === 'resolved' ? (
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide bg-green-500/20 text-green-500 ring-1 ring-green-500/30`}>
                                                Resolved
                                            </span>
                                        ) : (
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${cluster.priorityScore > 100 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                Score {Math.round(cluster.priorityScore)}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-4 text-xs mb-5 pl-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {cluster.reportCount} reports</span>
                                        <span>•</span>
                                        <span>{new Date(cluster.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="flex gap-2 pl-5">
                                        <button
                                            onClick={() => {
                                                setSelectedCluster(cluster);
                                                if (cluster.location && cluster.location.coordinates) {
                                                    setMapCenter([cluster.location.coordinates[1], cluster.location.coordinates[0]]);
                                                    setMapZoom(16);
                                                }
                                            }}
                                            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn ${isDarkMode ? 'bg-slate-700 hover:bg-blue-600/20 hover:text-blue-400 text-slate-300' : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600'}`}
                                        >
                                            View Details <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative order-1 md:order-2 h-1/2 md:h-auto">
                    <Map clusters={clusters} readOnly={true} center={mapCenter} zoom={mapZoom} />
                </div>
            </div>
        </div>
    );
}
