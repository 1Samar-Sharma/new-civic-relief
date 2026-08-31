import React, { useState, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
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
  ArrowLeft,
  X,
  ExternalLink,
  Layers,
  MapPin,
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { GoogleMapCircle } from './GoogleMapCircle';
import { useAuth } from '../../context/AuthContext';
import {
  resolveWomenSafetyAlertDoc,
  updateHelpRequestStatusDoc,
} from '../../lib/firebase';

interface GoogleMapsViewProps {
  apiKey: string;
  alerts: DisasterAlert[];
  womenAlerts: WomenSafetyAlert[];
  helpRequests: HelpRequest[];
  volunteers: VolunteerOffer[];
  safeHavens: SafeHavenPoint[];
  userLocation: Coordinates;
  userAddress?: string;
  activeSignal?: any | null;
  onSelectAlert?: (alert: DisasterAlert) => void;
  onSelectSOS?: (sos: WomenSafetyAlert) => void;
  onSelectHelpRequest?: (req: HelpRequest) => void;
  onSelectSafeHaven?: (haven: SafeHavenPoint) => void;
  onRequestAidAtLocation?: (coords: Coordinates) => void;
  onOpenBroadcastModal?: () => void;
  onSwitchToLeaflet?: () => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  apiKey,
  alerts = [],
  womenAlerts = [],
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
  onSwitchToLeaflet,
}) => {
  const { isAuthorOrAdmin } = useAuth();

  const [mapType, setMapType] = useState<google.maps.MapTypeId>(
    'roadmap' as unknown as google.maps.MapTypeId
  );
  const [show5kmRadar, setShow5kmRadar] = useState<boolean>(true);
  const [activeLayerFilter, setActiveLayerFilter] = useState<
    'all' | 'wildfire' | 'flood' | 'sos' | 'shelter' | 'aid' | 'volunteers'
  >('all');

  const [selectedItem, setSelectedItem] = useState<{
    type: 'alert' | 'sos' | 'request' | 'volunteer' | 'haven';
    data: any;
    position: google.maps.LatLngLiteral;
  } | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [camera, setCamera] = useState<{
    center: google.maps.LatLngLiteral;
    zoom: number;
  }>({
    center: {
      lat: Number.isFinite(userLocation.lat) ? userLocation.lat : 37.7749,
      lng: Number.isFinite(userLocation.lng) ? userLocation.lng : -122.4194,
    },
    zoom: 13,
  });

  const handleCameraChange = (e: MapCameraChangedEvent) => {
    setCamera(e.detail);
  };

  // Keep camera centered when userLocation coordinates change
  React.useEffect(() => {
    if (Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
      setCamera((prev) => ({
        ...prev,
        center: { lat: userLocation.lat, lng: userLocation.lng },
      }));
    }
  }, [userLocation.lat, userLocation.lng]);

  const handleRecenter = () => {
    setCamera({
      center: {
        lat: userLocation.lat,
        lng: userLocation.lng,
      },
      zoom: 14,
    });
  };

  // Filtered lists
  const filteredAlerts = useMemo(() => {
    if (activeLayerFilter === 'all') return alerts;
    if (activeLayerFilter === 'wildfire') return alerts.filter((a) => a.category === 'wildfire');
    if (activeLayerFilter === 'flood') return alerts.filter((a) => a.category === 'flood');
    return [];
  }, [alerts, activeLayerFilter]);

  const filteredSOS = useMemo(() => {
    if (activeLayerFilter === 'all' || activeLayerFilter === 'sos') {
      return womenAlerts.filter((s) => s.status === 'active_sos' || s.status === 'responder_en_route' || (s.status as string) === 'active');
    }
    return [];
  }, [womenAlerts, activeLayerFilter]);

  const filteredRequests = useMemo(() => {
    if (activeLayerFilter === 'all' || activeLayerFilter === 'aid') {
      return helpRequests.filter((r) => r.status === 'open' || r.status === 'matched' || r.status === 'in_progress' || (r.status as string) === 'in-progress');
    }
    return [];
  }, [helpRequests, activeLayerFilter]);

  const filteredVolunteers = useMemo(() => {
    if (activeLayerFilter === 'all' || activeLayerFilter === 'volunteers') {
      return volunteers.filter((v) => v.isAvailable !== false || (v as any).status === 'available');
    }
    return [];
  }, [volunteers, activeLayerFilter]);

  const filteredHavens = useMemo(() => {
    if (activeLayerFilter === 'all' || activeLayerFilter === 'shelter') {
      return safeHavens;
    }
    return [];
  }, [safeHavens, activeLayerFilter]);

  const handleResolveSOS = async (sosId: string) => {
    try {
      await resolveWomenSafetyAlertDoc(sosId);
      setActionSuccess('Emergency beacon resolved successfully.');
      setSelectedItem(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAid = async (reqId: string) => {
    try {
      await updateHelpRequestStatusDoc(reqId, 'fulfilled');
      setActionSuccess('Aid request marked as fulfilled!');
      setSelectedItem(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 font-sans">
      <APIProvider
        apiKey={apiKey}
        libraries={['marker', 'geometry']}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        <Map
          mapId="DEMO_MAP_ID"
          center={camera.center}
          zoom={camera.zoom}
          onCameraChanged={handleCameraChange}
          mapTypeId={mapType}
          disableDefaultUI={true}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(e) => {
            if (e.detail.latLng && onRequestAidAtLocation) {
              onRequestAidAtLocation({
                lat: e.detail.latLng.lat,
                lng: e.detail.latLng.lng,
              });
            }
          }}
        >
          {/* 5km Radius Radar Circle Around User */}
          {show5kmRadar && (
            <GoogleMapCircle
              center={{ lat: userLocation.lat, lng: userLocation.lng }}
              radius={5000}
              strokeColor="#06b6d4"
              strokeOpacity={0.8}
              strokeWeight={2}
              fillColor="#06b6d4"
              fillOpacity={0.08}
            />
          )}

          {/* Active 5km Emergency Signal Broadcast */}
          {activeSignal && (
            <GoogleMapCircle
              center={{ lat: activeSignal.location.lat, lng: activeSignal.location.lng }}
              radius={5000}
              strokeColor="#ef4444"
              strokeOpacity={0.9}
              strokeWeight={3}
              fillColor="#ef4444"
              fillOpacity={0.18}
            />
          )}

          {/* User Location Marker */}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title="Your Location"
            zIndex={100}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-cyan-400/40 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              </div>
            </div>
          </AdvancedMarker>

          {/* Disaster Alerts */}
          {filteredAlerts.map((alert) => (
            <AdvancedMarker
              key={alert.id}
              position={{ lat: alert.coordinates.lat, lng: alert.coordinates.lng }}
              title={alert.title}
              onClick={() => {
                setSelectedItem({
                  type: 'alert',
                  data: alert,
                  position: { lat: alert.coordinates.lat, lng: alert.coordinates.lng },
                });
                onSelectAlert?.(alert);
              }}
            >
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 border-2 border-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 fill-slate-950" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Women Safety SOS */}
          {filteredSOS.map((sos) => (
            <AdvancedMarker
              key={sos.id}
              position={{ lat: sos.location.lat, lng: sos.location.lng }}
              title={`SOS Beacon: ${sos.name}`}
              zIndex={90}
              onClick={() => {
                setSelectedItem({
                  type: 'sos',
                  data: sos,
                  position: { lat: sos.location.lat, lng: sos.location.lng },
                });
                onSelectSOS?.(sos);
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <span className="absolute -top-1 -left-1 w-10 h-10 rounded-full bg-rose-500/50 animate-ping" />
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white border-2 border-white shadow-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 fill-white" />
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {/* Mutual Aid Requests */}
          {filteredRequests.map((req) => (
            <AdvancedMarker
              key={req.id}
              position={{ lat: req.location.lat, lng: req.location.lng }}
              title={`Aid: ${req.title}`}
              onClick={() => {
                setSelectedItem({
                  type: 'request',
                  data: req,
                  position: { lat: req.location.lat, lng: req.location.lng },
                });
                onSelectHelpRequest?.(req);
              }}
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 border-2 border-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <HeartHandshake className="w-5 h-5 fill-slate-950" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Volunteers */}
          {filteredVolunteers.map((vol) => (
            <AdvancedMarker
              key={vol.id}
              position={{ lat: vol.location.lat, lng: vol.location.lng }}
              title={`Volunteer: ${vol.name}`}
              onClick={() => {
                setSelectedItem({
                  type: 'volunteer',
                  data: vol,
                  position: { lat: vol.location.lat, lng: vol.location.lng },
                });
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white border-2 border-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
            </AdvancedMarker>
          ))}

          {/* Safe Havens */}
          {filteredHavens.map((haven) => (
            <AdvancedMarker
              key={haven.id}
              position={{ lat: haven.coordinates.lat, lng: haven.coordinates.lng }}
              title={haven.name}
              onClick={() => {
                setSelectedItem({
                  type: 'haven',
                  data: haven,
                  position: { lat: haven.coordinates.lat, lng: haven.coordinates.lng },
                });
                onSelectSafeHaven?.(haven);
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white border border-white/80 shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <span className="text-xs font-black">
                  {haven.type === 'hospital' ? '🏥' : haven.type === 'fire_station' ? '🚒' : '🛡️'}
                </span>
              </div>
            </AdvancedMarker>
          ))}

          {/* Interactive InfoWindow */}
          {selectedItem && (
            <InfoWindow
              position={selectedItem.position}
              onCloseClick={() => setSelectedItem(null)}
            >
              <div className="p-2 text-slate-900 max-w-xs space-y-2">
                {selectedItem.type === 'alert' && (
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {selectedItem.data.category} Hazard
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-950 mt-1">
                      {selectedItem.data.title}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {selectedItem.data.description}
                    </p>
                    <div className="text-[11px] text-slate-600 mt-2 flex items-center justify-between font-semibold">
                      <span>Severity: {selectedItem.data.severity}</span>
                      <span>
                        {formatDistance(
                          calculateDistanceKm(userLocation, selectedItem.data.coordinates)
                        )}{' '}
                        away
                      </span>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'sos' && (
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-wider animate-pulse">
                      🚨 Women Emergency Beacon
                    </span>
                    <h4 className="font-extrabold text-sm text-rose-950 mt-1">
                      {selectedItem.data.name}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1">
                      {selectedItem.data.message || 'Immediate assistance requested.'}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {selectedItem.data.phone && (
                        <a
                          href={`tel:${selectedItem.data.phone}`}
                          className="w-full flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-500"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call ({selectedItem.data.phone})</span>
                        </a>
                      )}
                      {isAuthorOrAdmin(
                        selectedItem.data.userId,
                        selectedItem.data.authorEmail
                      ) && (
                        <button
                          onClick={() => handleResolveSOS(selectedItem.data.id)}
                          className="w-full py-1 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.type === 'request' && (
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      🤝 Mutual Aid Request
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-950 mt-1">
                      {selectedItem.data.title}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1">{selectedItem.data.description}</p>
                    <div className="text-[11px] text-slate-600 mt-1 font-semibold">
                      Urgency: {selectedItem.data.urgency} • Needs:{' '}
                      {selectedItem.data.category}
                    </div>
                    {isAuthorOrAdmin(
                      selectedItem.data.userId,
                      selectedItem.data.authorEmail
                    ) && (
                      <button
                        onClick={() => handleResolveAid(selectedItem.data.id)}
                        className="mt-2 w-full py-1 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-500 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Fulfilled</span>
                      </button>
                    )}
                  </div>
                )}

                {selectedItem.type === 'haven' && (
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 uppercase tracking-wider">
                      Verified Safe Haven
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-950 mt-1">
                      {selectedItem.data.name}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1">{selectedItem.data.address}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedItem.data.coordinates.lat},${selectedItem.data.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 w-full flex items-center justify-center gap-1 py-1 px-3 rounded-lg bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-500"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Maps Directions</span>
                    </a>
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Top Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
          <button
            onClick={() => setActiveLayerFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeLayerFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            All Hazards
          </button>
          <button
            onClick={() => setActiveLayerFilter('sos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeLayerFilter === 'sos'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>SOS ({womenAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveLayerFilter('aid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeLayerFilter === 'aid'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            <span>Aid ({helpRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveLayerFilter('wildfire')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeLayerFilter === 'wildfire'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Fire</span>
          </button>
        </div>

        {/* Map Mode & Radar Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Map Type Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <button
              onClick={() =>
                setMapType('roadmap' as unknown as google.maps.MapTypeId)
              }
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === ('roadmap' as unknown as google.maps.MapTypeId)
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Default
            </button>
            <button
              onClick={() =>
                setMapType('satellite' as unknown as google.maps.MapTypeId)
              }
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === ('satellite' as unknown as google.maps.MapTypeId)
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() =>
                setMapType('hybrid' as unknown as google.maps.MapTypeId)
              }
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapType === ('hybrid' as unknown as google.maps.MapTypeId)
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid
            </button>
          </div>

          {/* 5km Radar Toggle */}
          <button
            onClick={() => setShow5kmRadar(!show5kmRadar)}
            className={`p-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
              show5kmRadar
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="Toggle 5km Radar Zone"
          >
            <Radar className="w-4 h-4" />
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-white/10 backdrop-blur-xl shadow-2xl transition-all"
            title="Recenter Map to My Coordinates"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Switch to Leaflet fallback if user prefers */}
          {onSwitchToLeaflet && (
            <button
              onClick={onSwitchToLeaflet}
              className="px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-white/10 backdrop-blur-xl shadow-2xl text-xs font-bold transition-all"
              title="Switch to Leaflet OpenStreetMap"
            >
              OSM Map
            </button>
          )}
        </div>
      </div>

      {/* Floating Bottom Broadcast / Action Trigger */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="p-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/10 text-xs text-slate-300 pointer-events-auto flex items-center gap-2 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">Google Maps Platform Active</span>
          <span className="text-slate-400">|</span>
          <span>{userAddress}</span>
        </div>

        {onOpenBroadcastModal && (
          <button
            onClick={onOpenBroadcastModal}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-2xl border border-rose-400/40 pointer-events-auto flex items-center gap-2 transition-all"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Send 5km Signal</span>
          </button>
        )}
      </div>

      {/* Action Notification Toast */}
      {actionSuccess && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl z-50 animate-bounce">
          {actionSuccess}
        </div>
      )}
    </div>
  );
};
