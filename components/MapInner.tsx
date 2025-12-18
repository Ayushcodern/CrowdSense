'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Crosshair, Navigation } from 'lucide-react';

// Fix for default markers
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// center pin icon
const centerIcon = L.divIcon({
    html: `<div class="w-8 h-8 -mt-8 -ml-4 text-blue-600 drop-shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>
  </div>`,
    className: 'bg-transparent',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});


// Helper to notify parent of map moves (for center-pin picking)
function MapController({ onMove, trackUser }: { onMove?: (lat: number, lng: number) => void, trackUser?: boolean }) {
    const map = useMap();

    useMapEvents({
        moveend: () => {
            if (onMove) {
                const center = map.getCenter();
                onMove(center.lat, center.lng);
            }
        }
    });

    useEffect(() => {
        if (trackUser) {
            map.locate().on("locationfound", function (e) {
                map.flyTo(e.latlng, 16);
            });
        }
    }, [trackUser, map]);

    return null;
}

// Helper to update map view when props change
function FlyToCenter({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

interface MapProps {
    center?: [number, number];
    zoom?: number;
    clusters?: any[];
    readOnly?: boolean;
    onLocationSelect?: (lat: number, lng: number) => void;
    selectedLocation?: [number, number] | null;
    interactionMode?: 'static' | 'picker';
}

const MapInner = ({
    center = [20.5937, 78.9629],
    zoom = 5,
    clusters = [],
    readOnly = false,
    onLocationSelect,
    selectedLocation,
    interactionMode = 'static'
}: MapProps) => {

    const [mapRef, setMapRef] = useState<L.Map | null>(null);

    const handleLocateMe = () => {
        if (mapRef) {
            mapRef.locate().on("locationfound", function (e) {
                mapRef.flyTo(e.latlng, 16);
                if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng);
            });
        }
    };

    const getSeverityColor = (score: number) => {
        if (score > 100) return '#ef4444';
        if (score > 50) return '#f97316';
        return '#eab308';
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full rounded-lg z-0 min-h-[300px]"
                ref={setMapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    onMove={interactionMode === 'picker' ? onLocationSelect : undefined}
                />
                <FlyToCenter center={center} zoom={zoom} />

                {/* Existing Markers (Clusters) */}
                {clusters.map((cluster) => (
                    <Circle
                        key={cluster._id}
                        center={[cluster.location.coordinates[1], cluster.location.coordinates[0]]}
                        pathOptions={{
                            color: getSeverityColor(cluster.priorityScore),
                            fillColor: getSeverityColor(cluster.priorityScore),
                            fillOpacity: 0.6
                        }}
                        radius={50 + (cluster.reportCount * 5)}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm uppercase">{cluster.issueType}</h3>
                                <p className="text-xs">Priority Score: {Math.round(cluster.priorityScore)}</p>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* Read-Only Marker */}
                {interactionMode === 'static' && selectedLocation && (
                    <Marker position={selectedLocation} />
                )}

            </MapContainer>

            {/* Floating UI Elements */}
            {interactionMode === 'picker' && (
                <>
                    {/* Static Center Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none drop-shadow-2xl">
                        <div className="text-blue-600 relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2">
                                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <div className="w-1.5 h-1.5 bg-black/30 rounded-full blur-[2px] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1"></div>
                        </div>
                    </div>

                    {/* Locate Me Button */}
                    <button
                        onClick={handleLocateMe}
                        className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        <Navigation className="w-6 h-6" />
                    </button>
                </>
            )}
        </div>
    );
};

export default MapInner;
