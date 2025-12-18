import Link from 'next/link';
import { MapPin, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden selection:bg-blue-500/30">

            {/* Background Decor - Animated Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] animate-float"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
            </div>

            <div className="z-10 text-center max-w-3xl space-y-8 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium text-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse box-shadow-green"></span>
                    CrowdSense System Live
                </div>

                <h1 className="text-7xl font-bold tracking-tight animate-in zoom-in-50 duration-1000">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Turn Noise into</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Intelligence.</span>
                </h1>

                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    The next-generation civic issue platform. We use sophisticated clustering algorithms to transform thousands of complaints into prioritized action items for authorities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    {/* Report Card */}
                    <Link href="/report" className="group relative p-8 glass-card rounded-3xl hover:-translate-y-2 hover:shadow-blue-500/20 transition-all duration-300 text-left overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent group-hover:from-blue-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Report an Issue</h3>
                            <p className="text-slate-400 text-sm mb-8">I am a citizen reporting a problem.</p>
                            <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                                Start Reporting <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link href="/dashboard" className="group relative p-8 glass-card rounded-3xl hover:-translate-y-2 hover:shadow-purple-500/20 transition-all duration-300 text-left overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent group-hover:from-purple-500/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300">
                                <ShieldAlert className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Admin Console</h3>
                            <p className="text-slate-400 text-sm mb-8">Access the intelligence dashboard.</p>
                            <div className="flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                                Access Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-500 text-sm font-medium tracking-wide">
                Powered by MongoDB Geospatial Engine
            </div>
        </main>
    );
}
