import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  DisasterAlert,
  WomenSafetyAlert,
  HelpRequest,
  VolunteerOffer,
  SafeHavenPoint,
  Coordinates,
} from '../../types';
import {
  Flame,
  Shield,
  HeartHandshake,
  Crosshair,
  Compass,
  PhoneCall,
  CheckCircle,
  Radio,
  Radar,
  Lock,
  ArrowLeft,
  X,
  MapPin,
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { useAuth } from '../../context/AuthContext';
import {
  resolveWomenSafetyAlertDoc,
  updateHelpRequestStatusDoc,
  PUBLIC_COMMAND_NAME,
  PUBLIC_HELPLINE_PHONE,
} from '../../lib/firebase';

interface DisasterMapProps {
  alerts?: DisasterAlert[];
  disasterAlerts?: DisasterAlert[];
  womenAlerts?: WomenSafetyAlert[];
  womenSafetyAlerts?: WomenSafetyAlert[];
  helpRequests?: HelpRequest[];
  volunteers?: VolunteerOffer[];
  safeHavens?: SafeHavenPoint[];
  userLocation: Coordinates;
  userAddress?: string;
  activeSignal?: any | null;
  filters?: any;
  onToggleFilter?: (key: string) => void;
  onSelectAlert?: (alert: DisasterAlert) => void;
  onSelectSOS?: (sos: WomenSafetyAlert) => void;
  onSelectHelpRequest?: (req: HelpRequest) => void;
  onSelectSafeHaven?: (haven: SafeHavenPoint) => void;
  onRequestAidAtLocation?: (coords: Coordinates) => void;
  onOpenBroadcastModal?: () => void;
  onUpdateUserLocation?: (coords: Coordinates, address?: string) => void;
  onTriggerGPS?: () => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  alerts: alertsProp,
  disasterAlerts: disasterAlertsProp,
  womenAlerts: womenAlertsProp,
  womenSafetyAlerts: womenSafetyAlertsProp,
  helpRequests = [],
  volunteers = [],
  safeHavens = [],
  userLocation,
  userAddress = 'Your Current Area',
  activeSignal = null,
  onSelectAlert,
  onSelectSOS,
  onSelectHelpRequest,
  onSelectSafeHaven,
  onRequestAidAtLocation,
  onOpenBroadcastModal,
  onUpdateUserLocation,
  onTriggerGPS,
}) => {
  const { isAuthorOrAdmin } = useAuth();
  const alerts = alertsProp || disasterAlertsProp || [];
  const womenAlerts = womenAlertsProp || womenSafetyAlertsProp || [];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [show5kmRadar, setShow5kmRadar] = useState<boolean>(true);
  const [activeLayerFilter, setActiveLayerFilter] = useState<
    'all' | 'wildfire' | 'flood' | 'sos' | 'shelter' | 'aid' | 'volunteers'
  >('all');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<
    'alert' | 'sos' | 'request' | 'volunteer' | 'haven' | null
  >(null);
  const [clickCoords, setClickCoords] = useState<Coordinates | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Tile Layer Style (100% Free, High-Clarity Place Names, 0 Watermarks)
  const [mapStyle, setMapStyle] = useState<'osm' | 'voyager' | 'satellite' | 'humanitarian'>('osm');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map with ResizeObserver & size invalidation
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const safeLat = Number.isFinite(userLocation.lat) ? userLocation.lat : 37.7749;
    const safeLng = Number.isFinite(userLocation.lng) ? userLocation.lng : -122.4194;

    const map = L.map(mapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Default to OpenStreetMap with full street and place names
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);
    tileLayerRef.current = baseLayer;

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Trigger map invalidation on load to prevent grey or misaligned tiles
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);
    const timer3 = setTimeout(() => map.invalidateSize(), 1000);

    // Map click event
    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // ResizeObserver for fluid responsiveness
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Style changes dynamically without reloading map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    if (mapStyle === 'osm') {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);
    } else if (mapStyle === 'voyager') {
      tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
    } else if (mapStyle === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);
      // High-contrast place names and road labels overlay
      labelLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
    } else if (mapStyle === 'humanitarian') {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);
    }
  }, [mapStyle]);

  // Update center and invalidate size when userLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], mapInstanceRef.current.getZoom() || 13);
    }
  }, [userLocation.lat, userLocation.lng]);

  // Update Markers & Danger Polygons when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. User Position Marker & 5km Defense Radar Circle
    if (show5kmRadar) {
      const isCriticalSignal = activeSignal && (activeSignal.isUrgentRedAlert || activeSignal.urgency === 'critical_urgent');
      L.circle([userLocation.lat, userLocation.lng], {
        radius: (activeSignal?.radiusKm ? activeSignal.radiusKm * 1000 : 5000),
        color: isCriticalSignal ? '#ef4444' : '#38bdf8',
        fillColor: isCriticalSignal ? '#dc2626' : '#0284c7',
        fillOpacity: isCriticalSignal ? 0.12 : 0.05,
        weight: isCriticalSignal ? 2.5 : 1.5,
        dashArray: isCriticalSignal ? '4, 4' : '6, 8',
      })
        .bindTooltip(
          isCriticalSignal
            ? `🚨 ACTIVE 5KM URGENT RED ALERT DISTRESS PERIMETER`
            : `📡 5.0 KM Civic Defense Perimeter (${userAddress})`,
          { permanent: false }
        )
        .addTo(layerGroup);
    }

    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${
            activeSignal ? 'bg-red-400' : 'bg-emerald-400'
          } opacity-75"></span>
          <div class="h-6 w-6 rounded-full ${
            activeSignal ? 'bg-red-500' : 'bg-emerald-500'
          } border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-black text-white">
            ${activeSignal ? '🚨' : '📍'}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindTooltip(`You are here: ${userAddress}`, { permanent: false })
      .addTo(layerGroup);

    // 2. Disaster Alerts (Wildfires, Floods, Earthquakes)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'wildfire' || activeLayerFilter === 'flood') {
      alerts.forEach((alert) => {
        if (activeLayerFilter === 'wildfire' && alert.category !== 'wildfire') return;
        if (activeLayerFilter === 'flood' && alert.category !== 'flood' && alert.category !== 'landslide') return;

        const isFire = alert.category === 'wildfire';
        const isFlood = alert.category === 'flood';
        const color = isFire ? '#f97316' : isFlood ? '#06b6d4' : '#eab308';
        const fillColor = isFire ? '#ea580c' : isFlood ? '#0284c7' : '#ca8a04';

        L.circle([alert.coordinates.lat, alert.coordinates.lng], {
          radius: alert.radiusMeters || 1500,
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: isFire ? '6, 6' : undefined,
        }).addTo(layerGroup);

        const iconHtml = `
          <div class="relative group cursor-pointer flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full ${
              isFire ? 'bg-orange-500' : 'bg-cyan-500'
            } opacity-50"></span>
            <div class="h-8 w-8 rounded-xl ${
              isFire
                ? 'bg-orange-600'
                : 'bg-cyan-600'
            } border-2 border-white shadow-xl flex items-center justify-center text-white text-sm font-bold">
              ${isFire ? '🔥' : isFlood ? '🌊' : '⚠️'}
            </div>
          </div>
        `;

        const marker = L.marker([alert.coordinates.lat, alert.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedEntity(alert);
          setSelectedType('alert');
          onSelectAlert?.(alert);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([alert.coordinates.lat, alert.coordinates.lng], 14);
          }
        });
      });
    }

    // 3. Women Safety SOS Live Beacons
    if (activeLayerFilter === 'all' || activeLayerFilter === 'sos') {
      womenAlerts.forEach((sos) => {
        const isSOS = sos.status === 'active_sos';

        L.circle([sos.coordinates.lat, sos.coordinates.lng], {
          radius: 400,
          color: isSOS ? '#f43f5e' : '#ec4899',
          fillColor: isSOS ? '#e11d48' : '#db2777',
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(layerGroup);

        const iconHtml = `
          <div class="relative cursor-pointer flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-rose-500 opacity-75"></span>
            <div class="h-8 w-8 rounded-full bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black animate-bounce">
              🚨
            </div>
          </div>
        `;

        const marker = L.marker([sos.coordinates.lat, sos.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedEntity(sos);
          setSelectedType('sos');
          onSelectSOS?.(sos);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([sos.coordinates.lat, sos.coordinates.lng], 15);
          }
        });
      });
    }

    // 4. Safe Havens & Shelters
    if (activeLayerFilter === 'all' || activeLayerFilter === 'shelter') {
      safeHavens.forEach((haven) => {
        const isFull = haven.capacityOccupied >= haven.capacityTotal;
        const iconHtml = `
          <div class="relative cursor-pointer flex items-center justify-center group">
            <div class="h-7 w-7 rounded-lg ${
              isFull ? 'bg-amber-600' : 'bg-emerald-600'
            } border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              🏠
            </div>
          </div>
        `;

        const marker = L.marker([haven.coordinates.lat, haven.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedEntity(haven);
          setSelectedType('haven');
          onSelectSafeHaven?.(haven);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([haven.coordinates.lat, haven.coordinates.lng], 15);
          }
        });
      });
    }

    // 5. Aid Requests
    if (activeLayerFilter === 'all' || activeLayerFilter === 'aid') {
      helpRequests.forEach((req) => {
        if (req.status === 'fulfilled') return;
        const isUrgent = req.urgency === 'immediate_life_threat';
        const categoryEmojis: Record<string, string> = {
          shelter: '🛏️',
          medical: '💊',
          food_water: '🍲',
          manpower: '👷',
          clothing: '🧥',
          power_transport: '⚡',
        };

        const iconHtml = `
          <div class="relative cursor-pointer flex items-center justify-center">
            <div class="h-7 w-7 rounded-lg ${
              isUrgent ? 'bg-rose-600' : 'bg-amber-600'
            } border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              ${categoryEmojis[req.category] || '🤝'}
            </div>
          </div>
        `;

        const marker = L.marker([req.coordinates.lat, req.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedEntity(req);
          setSelectedType('request');
          onSelectHelpRequest?.(req);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([req.coordinates.lat, req.coordinates.lng], 15);
          }
        });
      });
    }

    // 6. Active Volunteers
    if (activeLayerFilter === 'all' || activeLayerFilter === 'volunteers') {
      volunteers.forEach((vol) => {
        if (!vol.isAvailable) return;
        const iconHtml = `
          <div class="relative cursor-pointer flex items-center justify-center group">
            <div class="h-6 w-6 rounded-full bg-blue-600 border border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
              🛡️
            </div>
          </div>
        `;

        const marker = L.marker([vol.coordinates.lat, vol.coordinates.lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedEntity(vol);
          setSelectedType('volunteer');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([vol.coordinates.lat, vol.coordinates.lng], 15);
          }
        });
      });
    }
  }, [alerts, womenAlerts, helpRequests, volunteers, safeHavens, activeLayerFilter, userLocation]);

  const recenterMap = () => {
    onTriggerGPS?.();
    if (mapInstanceRef.current && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.2,
      });
    }
  };

  const clearSelection = () => {
    setSelectedEntity(null);
    setSelectedType(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] min-h-[550px] bg-[#050810]/60 flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Map Control Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filter Pills */}
        <div className="flex items-center gap-1 bg-[#050810]/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-lg pointer-events-auto overflow-x-auto max-w-full text-xs">
          <button
            onClick={() => setActiveLayerFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeLayerFilter === 'all'
                ? 'bg-white text-black shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Items ({alerts.length + womenAlerts.length + helpRequests.length})
          </button>

          <button
            onClick={() => setActiveLayerFilter('wildfire')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeLayerFilter === 'wildfire'
                ? 'bg-orange-500 text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🔥 Wildfires</span>
          </button>

          <button
            onClick={() => setActiveLayerFilter('sos')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeLayerFilter === 'sos'
                ? 'bg-rose-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🚨 SOS ({womenAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveLayerFilter('shelter')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeLayerFilter === 'shelter'
                ? 'bg-emerald-500 text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🏠 Shelters ({safeHavens.length})</span>
          </button>

          <button
            onClick={() => setActiveLayerFilter('aid')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeLayerFilter === 'aid'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🤝 Aid Requests ({helpRequests.length})</span>
          </button>
        </div>

        {/* GPS, Radar & Place Names Map Style Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Style Selector (Places & Streets) */}
          <div className="flex items-center bg-[#050810]/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-lg text-xs">
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                mapStyle === 'osm'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard OpenStreetMap (Clear Place Names & Streets, Zero Watermark)"
            >
              📍 Places & Streets
            </button>
            <button
              onClick={() => setMapStyle('voyager')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                mapStyle === 'voyager'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="CartoDB Voyager (High Clarity Place Labels)"
            >
              🏙️ Clean
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite with Place Names & Road Labels"
            >
              🛰️ Satellite + Labels
            </button>
          </div>

          <button
            onClick={() => setShow5kmRadar(!show5kmRadar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-xl border transition-all ${
              show5kmRadar
                ? 'bg-blue-500/25 text-blue-200 border-blue-400/50'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/10'
            }`}
            title="Toggle 5km Defense Radar Ring"
          >
            <Radar className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">5km Radar {show5kmRadar ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={recenterMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg text-xs font-bold backdrop-blur-xl transition-all"
            title="Recenter map to my GPS location"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </div>

      {/* The Leaflet Canvas Map */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-[#050810]/85 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/10 text-[11px] shadow-2xl text-slate-300">
        <span className="font-bold text-slate-400 uppercase text-[9px]">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span> Fire Zone
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> SOS Beacon
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Shelter
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500"></span> Aid Pin
        </span>
      </div>

      {/* Click Map Helper Toast */}
      {clickCoords && !selectedEntity && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#050810]/95 border border-emerald-500/50 text-slate-200 px-4 py-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs backdrop-blur-xl animate-fadeIn">
          <div>
            <p className="font-bold text-emerald-300">
              📍 Point: {clickCoords.lat.toFixed(4)}°, {clickCoords.lng.toFixed(4)}°
            </p>
            <p className="text-[11px] text-slate-400">
              Set active post or request mutual aid at this point:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onUpdateUserLocation?.(clickCoords);
                setClickCoords(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold whitespace-nowrap transition-all shadow-md"
            >
              Set My Location
            </button>
            <button
              onClick={() => {
                onRequestAidAtLocation?.(clickCoords);
                setClickCoords(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold whitespace-nowrap transition-all shadow-md"
            >
              Request Aid Here
            </button>
            <button
              onClick={() => setClickCoords(null)}
              className="text-slate-400 hover:text-slate-200 text-sm font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Selected Entity Detail Drawer with Clear Back Navigation */}
      {selectedEntity && (
        <div className="absolute bottom-3 right-3 z-[1000] w-full max-w-md bg-[#050810]/95 border border-white/20 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl animate-fadeIn max-h-[80vh] overflow-y-auto">
          {/* Header with Prominent Back to Map Button */}
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all mr-1"
                title="Return to Map"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Back</span>
              </button>
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {selectedType?.toUpperCase()} DETAILS
                </span>
                <h3 className="font-bold text-sm text-white leading-snug mt-0.5">
                  {selectedEntity.title ||
                    selectedEntity.name ||
                    selectedEntity.codeName ||
                    selectedEntity.subCategory ||
                    selectedEntity.volunteerName}
                </h3>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              title="Close Details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Distance from user */}
          {selectedEntity.coordinates && (
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mb-3">
              <Compass className="w-3 h-3" />
              <span>
                {formatDistance(calculateDistanceKm(userLocation, selectedEntity.coordinates))} from your live GPS
              </span>
            </p>
          )}

          {/* Alert View */}
          {selectedType === 'alert' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">{selectedEntity.description}</p>
              <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/10 text-[11px]">
                <div>
                  <span className="text-slate-400">Location:</span>
                  <p className="font-semibold text-slate-200">{selectedEntity.locationName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Source:</span>
                  <p className="font-semibold text-slate-200">{selectedEntity.source || 'USGS / NOAA'}</p>
                </div>
              </div>

              {selectedEntity.recommendedActions?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[11px] text-amber-400 uppercase tracking-wider mb-1">
                    Recommended Actions:
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    {selectedEntity.recommendedActions.map((act: string, i: number) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SOS View */}
          {selectedType === 'sos' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px]">
                    Status: {selectedEntity.status === 'safe_resolved' ? 'SAFE & RESOLVED' : 'ACTIVE SOS BEACON'}
                  </span>
                  <span className="text-[10px] text-rose-400">
                    {selectedEntity.timestamp}
                  </span>
                </div>
                <p className="mt-1.5 text-slate-100 font-medium">{selectedEntity.notes}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  📍 {selectedEntity.addressApprox}
                </p>
                <div className="mt-2 text-[10px] text-slate-400">
                  Beacon Author: <span className="text-white font-semibold">{selectedEntity.authorName || selectedEntity.codeName || 'Civilian'}</span>
                </div>
              </div>

              {actionSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {selectedEntity.status !== 'safe_resolved' && (
                isAuthorOrAdmin(selectedEntity.userId, selectedEntity.authorEmail) ? (
                  <button
                    onClick={async () => {
                      try {
                        await resolveWomenSafetyAlertDoc(selectedEntity.id);
                        setActionSuccess('Beacon marked Safe & Resolved!');
                        setTimeout(() => setActionSuccess(null), 3000);
                      } catch (err: any) {
                        alert(err.message || 'Failed to resolve beacon');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Beacon Safe & Close Incident</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Resolution restricted to author or {PUBLIC_COMMAND_NAME} (Helpline: {PUBLIC_HELPLINE_PHONE}).
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Safe Haven View */}
          {selectedType === 'haven' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">📍 {selectedEntity.address}</p>
              <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Occupancy:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedEntity.capacityOccupied} / {selectedEntity.capacityTotal} Beds
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedEntity.capacityOccupied / selectedEntity.capacityTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {selectedEntity.amenities?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Amenities:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntity.amenities.map((amenity: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-white/5 text-emerald-300 border border-emerald-500/20 text-[10px]"
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntity.contactPhone && (
                <div className="pt-1">
                  <a
                    href={`tel:${selectedEntity.contactPhone}`}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Shelter ({selectedEntity.contactPhone})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Help Request View */}
          {selectedType === 'request' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-slate-200">{selectedEntity.description}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>People in need: {selectedEntity.peopleCount || 1}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase text-[9px] border border-amber-500/40">
                    {selectedEntity.urgency?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  Requester: <span className="text-white font-semibold">{selectedEntity.requesterName}</span>
                </div>
              </div>

              {actionSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {selectedEntity.status !== 'fulfilled' && (
                isAuthorOrAdmin(selectedEntity.userId, selectedEntity.authorEmail) ? (
                  <button
                    onClick={async () => {
                      try {
                        await updateHelpRequestStatusDoc(selectedEntity.id, 'fulfilled');
                        setActionSuccess('Request marked Fulfilled & Closed!');
                        setTimeout(() => setActionSuccess(null), 3000);
                      } catch (err: any) {
                        alert(err.message || 'Failed to update request');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Fulfilled & Close Request</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Closing restricted to author ({selectedEntity.requesterName}) or {PUBLIC_COMMAND_NAME}.
                    </span>
                  </div>
                )
              )}

              <button
                onClick={() => onSelectHelpRequest?.(selectedEntity)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
              >
                🤝 Pledge This Aid (Open Aid Details)
              </button>
            </div>
          )}

          {/* Volunteer View */}
          {selectedType === 'volunteer' && (
            <div className="space-y-3 text-xs">
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-blue-300">Verified Civic Responder</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedEntity.missionsCompleted} Missions Completed
                </p>
                <p className="text-slate-300 text-xs mt-2">{selectedEntity.capacityDetails}</p>
              </div>
            </div>
          )}

          {/* Bottom Close Button for easy mobile dismissal */}
          <div className="pt-2 border-t border-white/10 mt-3">
            <button
              onClick={clearSelection}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Close & Back to Map</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
