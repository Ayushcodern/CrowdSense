'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Camera, MapPin, Navigation, Tag, AlertTriangle, AlertOctagon, Volume2, Car, Lightbulb, Truck, ChevronRight, X, CheckCircle, ArrowLeft } from 'lucide-react';

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function ReportPage() {
    const [step, setStep] = useState(1);
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        issueType: '',
        severity: 3,
        description: '',
        tags: [] as string[],
        imageUrl: ''
    });

    const issueTypes = [
        { id: 'pothole', label: 'Pothole', icon: <AlertTriangle className="w-6 h-6" /> },
        { id: 'garbage', label: 'Garbage', icon: <Truck className="w-6 h-6" /> },
        { id: 'light', label: 'Street Light', icon: <Lightbulb className="w-6 h-6" /> },
        { id: 'safety', label: 'Safety', icon: <AlertOctagon className="w-6 h-6" /> },
        { id: 'noise', label: 'Noise', icon: <Volume2 className="w-6 h-6" /> },
        { id: 'traffic', label: 'Traffic', icon: <Car className="w-6 h-6" /> },
    ];

    const tagOptions = ['Urgent', 'Blocking Road', 'Recurring', 'Health Hazard', 'Smell'];

    const handleLocationSelect = (lat: number, lng: number) => {
        setLocation([lat, lng]);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTag = (tag: string) => {
        setFormData(prev => {
            const tags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags };
        });
    };

    const handleSubmit = async () => {
        if (!location || !formData.issueType) return;

        setLoading(true);
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    location: { type: 'Point', coordinates: [location[1], location[0]] },
                }),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Failed to submit report');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting report');
        } finally {
            setLoading(false);
        }
    };

    const getProgressWidth = () => {
        switch (step) {
            case 1: return '33%';
            case 2: return '66%';
            case 3: return '100%';
            default: return '0%';
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in duration-700 font-sans">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full relative overflow-hidden ring-1 ring-slate-100/50">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                    <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 animate-[bounce_1s_infinite]">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Report Sent</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed">Thank you for helping improve our city. Your issue has been logged and clustered.</p>
                    <Link href="/" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl hover:shadow-2xl">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 md:p-6 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden min-h-[680px] flex flex-col relative transition-all duration-500 border border-white/50 ring-1 ring-slate-100">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">Step {step} of 3</div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        {step === 1 && 'Location'}
                        {step === 2 && 'Details'}
                        {step === 3 && 'Description'}
                    </h1>

                    {/* Minimal Progress Bar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
                        <div
                            className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                            style={{ width: getProgressWidth() }}
                        ></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 relative scrollbar-hide">

                    {/* STEP 1: LOCATION */}
                    <div className={`transition-all duration-500 absolute inset-0 p-8 pt-0 flex flex-col ${step === 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
                        {!isManualLocation ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="relative p-8 bg-gradient-to-br from-blue-50 to-white rounded-[2rem] text-blue-600 shadow-lg ring-1 ring-blue-100">
                                        <Navigation className="w-12 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-3 max-w-[240px]">
                                    <h3 className="text-xl font-bold text-slate-900">Enable Location</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        We need your location to precisely pin the issue.
                                    </p>
                                </div>
                                <div className="w-full space-y-4 pt-4">
                                    <button
                                        onClick={() => {
                                            navigator.geolocation.getCurrentPosition(
                                                (pos) => {
                                                    setLocation([pos.coords.latitude, pos.coords.longitude]);
                                                    setStep(2);
                                                },
                                                (err) => {
                                                    alert('Location access denied. Please enter manually.');
                                                    setIsManualLocation(true);
                                                }
                                            );
                                        }}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Grant Access
                                    </button>
                                    <button
                                        onClick={() => setIsManualLocation(true)}
                                        className="text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        Enter location manually
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col h-full">
                                <p className="text-sm text-slate-500 mb-4 font-medium px-1">Tap to pin exact location:</p>
                                <div className="flex-1 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner relative z-0 ring-4 ring-slate-50">
                                    <Map
                                        interactionMode="picker"
                                        onLocationSelect={handleLocationSelect}
                                    />
                                    {/* Map overlay hint */}
                                    {!location && (
                                        <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                                                Tap map to set pin
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    disabled={!location}
                                    onClick={() => setStep(2)}
                                    className="mt-6 w-full py-4 bg-slate-900 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:shadow-none"
                                >
                                    Confirm Pin
                                </button>
                            </div>
                        )}
                    </div>


                    {/* STEP 2: CATEGORY */}
                    <div className={`transition-all duration-500 absolute inset-0 p-8 pt-0 flex flex-col ${step === 2 ? 'translate-x-0 opacity-100 delay-100' : step < 2 ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none'}`}>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block px-1">Select Type</label>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {issueTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            let severity = 3;
                                            if (['pothole', 'garbage', 'noise'].includes(type.id)) severity = 3;
                                            if (['light', 'traffic'].includes(type.id)) severity = 2;
                                            if (['safety', 'water'].includes(type.id)) severity = 5;

                                            setFormData(prev => ({ ...prev, issueType: type.id, severity }));
                                            setStep(3);
                                        }}
                                        className={`p-4 rounded-[1.5rem] border transition-all duration-300 flex flex-col items-center gap-3 group relative overflow-hidden ${formData.issueType === type.id
                                            ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-lg shadow-blue-500/10'
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl transition-all duration-300 ${formData.issueType === type.id
                                                ? 'bg-blue-500 text-white scale-110'
                                                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                                            }`}>
                                            {type.icon}
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* STEP 3: DETAILS */}
                    <div className={`transition-all duration-500 absolute inset-0 p-8 pt-0 flex flex-col overflow-y-auto ${step === 3 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                        <div className="space-y-8 pb-4">

                            {/* Tags Input */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">Add Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {tagOptions.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${formData.tags.includes(tag)
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">Description</label>
                                <textarea
                                    className="w-full p-5 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-slate-100 focus:border-slate-900 outline-none resize-none text-sm bg-slate-50/50 focus:bg-white transition-all duration-300 text-slate-900 placeholder:text-slate-400 min-h-[140px] leading-relaxed shadow-sm"
                                    placeholder="Please describe the issue in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Photo Upload */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">Evidence</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />

                                {formData.imageUrl ? (
                                    <div className="relative group rounded-[1.5rem] overflow-hidden shadow-xl aspect-video cursor-pointer border border-slate-100" onClick={() => fileInputRef.current?.click()}>
                                        <img src={formData.imageUrl} alt="Issue Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                Change Photo
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400/50 hover:text-blue-500 hover:bg-blue-50/30 transition-all duration-300 group"
                                    >
                                        <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold tracking-wide">TAP TO UPLOAD</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Submit Report <ChevronRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
