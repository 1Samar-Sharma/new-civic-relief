import React, { useState, useEffect } from 'react';
import {
  Radio,
  AlertTriangle,
  Send,
  MapPin,
  Shield,
  Wind,
  Droplets,
  HeartPulse,
  Home,
  Users,
  Compass,
  Volume2,
  CheckCircle2,
  Sparkles,
  Layers,
  Battery,
  Wifi,
  Navigation,
  X,
  AlertCircle
} from 'lucide-react';
import { Coordinates } from '../../types';
import { soundPlayer } from '../../utils/audio';
import { formatDistance } from '../../utils/geo';

export interface BroadcastSignalData {
  id: string;
  title: string;
  description: string;
  urgency: 'critical_urgent' | 'high' | 'standard';
  category: string;
  radiusKm: number;
  coordinates: Coordinates;
  address: string;
  peopleReached: number;
  isUrgentRedAlert: boolean;
  type?: string;
  timestamp?: string;
  createdAt?: number;
  respondersPledged?: number;
}

interface BroadcastSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: Coordinates;
  userAddress: string;
  gpsAccuracy?: number;
  onBroadcastSuccess: (signalData: BroadcastSignalData) => void;
}

export const BroadcastSignalModal: React.FC<BroadcastSignalModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  userAddress,
  gpsAccuracy = 5,
  onBroadcastSuccess,
}) => {
  const [urgency, setUrgency] = useState<'critical_urgent' | 'high' | 'standard'>('critical_urgent');
  const [radiusKm, setRadiusKm] = useState<number>(5.0);
  const [category, setCategory] = useState<string>('weather_emergency');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [includeLocation, setIncludeLocation] = useState<boolean>(true);
  const [soundAlert, setSoundAlert] = useState<boolean>(true);
  
  // Broadcasting state
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastStep, setBroadcastStep] = useState<number>(0);
  const [reachedCount, setReachedCount] = useState<number>(0);

  // Quick preset templates
  const presets = [
    {
      category: 'weather_emergency',
      icon: Wind,
      label: 'Severe Weather / Cloudburst Alert',
      defaultUrgency: 'critical_urgent' as const,
      defaultTitle: 'URGENT: Severe Cloudburst / Storm Inundation - Need Evacuation',
      defaultDesc: 'Rapidly rising water and severe wind threat. Need urgent transport to nearest safe haven for family.',
    },
    {
      category: 'flood',
      icon: Droplets,
      label: 'Flash Flood / Water Inundation',
      defaultUrgency: 'critical_urgent' as const,
      defaultTitle: 'Rising Flood Water - Sandbags & Manpower Needed',
      defaultDesc: 'Water level entering basement/ground floor. Need assistance moving vulnerable residents and supplies.',
    },
    {
      category: 'medical',
      icon: HeartPulse,
      label: 'Medical Trauma / First-Aid',
      defaultUrgency: 'critical_urgent' as const,
      defaultTitle: 'Medical Emergency - CPR / First-Aid Kit Needed',
      defaultDesc: 'Medical trauma reported at current coordinates. Requesting any nearby doctor, nurse, or AED holder.',
    },
    {
      category: 'shelter',
      icon: Home,
      label: 'Emergency Shelter Lodging',
      defaultUrgency: 'high' as const,
      defaultTitle: 'Emergency Shelter Needed for Displaced Family',
      defaultDesc: 'Displaced due to local hazard. Looking for clean dry lodging for 3 people for 2 nights.',
    },
    {
      category: 'manpower',
      icon: Users,
      label: 'Community Rescue & Route Clearing',
      defaultUrgency: 'high' as const,
      defaultTitle: 'Debris / Fallen Tree Blocking Access Road',
      defaultDesc: 'Access road blocked by fallen branches/mud. Need 4-5 volunteers with shovels or chainsaws.',
    },
  ];

  // Set default title & desc on mount / category change if empty
  useEffect(() => {
    if (!title) {
      const match = presets.find((p) => p.category === category);
      if (match) {
        setTitle(match.defaultTitle);
        setDescription(match.defaultDesc);
        setUrgency(match.defaultUrgency);
      }
    }
  }, [category]);

  if (!isOpen) return null;

  const estimatedReach = Math.round(radiusKm * radiusKm * 5.8 + 14);

  const handleSelectPreset = (p: typeof presets[0]) => {
    setCategory(p.category);
    setTitle(p.defaultTitle);
    setDescription(p.defaultDesc);
    setUrgency(p.defaultUrgency);
  };

  const handleStartBroadcast = () => {
    setIsBroadcasting(true);
    setBroadcastStep(1);

    if (soundAlert) {
      if (urgency === 'critical_urgent') {
        soundPlayer.playUrgentDistressPulse();
      } else {
        soundPlayer.playBroadcastHandshake();
      }
    }

    // Step 1: 1km ring
    setTimeout(() => {
      setBroadcastStep(2);
      setReachedCount(Math.round(estimatedReach * 0.35));
    }, 700);

    // Step 2: 3km ring
    setTimeout(() => {
      setBroadcastStep(3);
      setReachedCount(Math.round(estimatedReach * 0.75));
    }, 1500);

    // Step 3: Full 5km ring
    setTimeout(() => {
      setBroadcastStep(4);
      setReachedCount(estimatedReach);
      if (soundAlert) soundPlayer.playBroadcastHandshake();
    }, 2300);

    // Finalize
    setTimeout(() => {
      setIsBroadcasting(false);
      onBroadcastSuccess({
        id: `sig-${Date.now()}`,
        title: title || '5km Community Emergency Signal',
        description: description || 'Active help signal transmitted to all neighbors in 5km radius.',
        urgency,
        category,
        radiusKm,
        coordinates: userLocation,
        address: userAddress,
        peopleReached: estimatedReach,
        isUrgentRedAlert: urgency === 'critical_urgent',
      });
      onClose();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#050810]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fadeIn text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  5km Perimeter Signal Transmitter
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40 text-[10px]">
                  CIVIC MESH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Beams high-priority distress telemetry to verified guardians and residents within {radiusKm} km of your live GPS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isBroadcasting}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isBroadcasting ? (
          /* Live Transmission Animation View */
          <div className="py-8 space-y-6 text-center">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              {/* Pulsing Concentric Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
              <div className="absolute -inset-4 rounded-full border border-red-400/20 animate-pulse" />
              <div className="absolute -inset-8 rounded-full border border-red-400/10" />
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]">
                <Radio className="w-10 h-10 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-xs font-bold uppercase tracking-wider">
                {urgency === 'critical_urgent' ? '🚨 TRANSMITTING URGENT DISTRESS SIGNAL' : '📡 BROADCASTING AID SIGNAL'}
              </span>
              <h3 className="text-lg font-black text-white">
                Synchronizing with Local 5km Civic Network
              </h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Transmitting real-time GPS coordinates ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}) to nearby citizens and emergency response teams...
              </p>
            </div>

            {/* Broadcast Step Tracker */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-left text-xs">
              <div className={`flex items-center justify-between transition-all ${broadcastStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 1.0 km Inner Sector (Immediate Neighbors)
                </span>
                <span>{broadcastStep >= 1 ? 'LOCKED' : 'CONNECTING...'}</span>
              </div>
              <div className={`flex items-center justify-between transition-all ${broadcastStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 3.0 km District Sector (Guardians & First Responders)
                </span>
                <span>{broadcastStep >= 2 ? 'LOCKED' : 'PENDING'}</span>
              </div>
              <div className={`flex items-center justify-between transition-all ${broadcastStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 5.0 km Perimeter (All Connected Residents: ~{reachedCount})
                </span>
                <span>{broadcastStep >= 3 ? 'REACHED' : 'SYNCHRONIZING'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div className="space-y-4">
            {/* Urgency Level Selector */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
                1. Signal Priority Level:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('critical_urgent')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    urgency === 'critical_urgent'
                      ? 'bg-red-500/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-red-400 font-black text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>CRITICAL / URGENT</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Immediate life threat or attack. Activates audible 5km red beacon.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('high')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    urgency === 'high'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>HIGH PRIORITY</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Urgent aid required within 2 hours (evacuation, medication, trap).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('standard')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    urgency === 'standard'
                      ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                    <Users className="w-4 h-4" />
                    <span>COMMUNITY AID</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    General mutual aid (food, clean water, blankets, sandbag help).
                  </p>
                </button>
              </div>
            </div>

            {/* Broadcast Radius Range */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  2. Broadcast Perimeter Radius:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-xs border border-blue-500/40">
                  {radiusKm.toFixed(1)} km (~{estimatedReach} residents)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1.0, 3.0, 5.0, 10.0].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadiusKm(r)}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      radiusKm === r
                        ? 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 5.0 ? '5.0 km (Standard)' : `${r.toFixed(0)} km`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-medium text-[11px]">
                Quick Emergency Category Presets:
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {presets.map((p) => {
                  const Icon = p.icon;
                  const isSelected = category === p.category;
                  return (
                    <button
                      key={p.category}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-white/15 border-white/40 text-white font-bold'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-red-400" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Incident Title & Details */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold text-xs">
                  Signal Subject / Headline:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent Help Needed: Individual Under Threat at Corner of 8th"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold text-xs">
                  Situation & Specific Needs:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your current threat, required resources (CPR, 4x4, shelter), and exact landmarks..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Live GPS Telemetry Attachment Card */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                    <span>Live GPS Locked</span>
                    <span className="text-[10px] text-emerald-400">±{gpsAccuracy}m</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate max-w-sm">
                    {userAddress} ({userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> 84%
                </span>
                <span className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Mesh Ready
                </span>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundAlert}
                  onChange={(e) => setSoundAlert(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-red-500 focus:ring-0"
                />
                <span className="text-xs">Sound acoustic alarm / mesh handshake chime</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Pinging ~{estimatedReach} nearby guardians
              </span>
            </div>

            {/* Submit Broadcast Button */}
            <button
              type="button"
              onClick={handleStartBroadcast}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                urgency === 'critical_urgent'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-pulse border border-red-400/50'
                  : urgency === 'high'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 border border-amber-400/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 border border-blue-400/50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {urgency === 'critical_urgent'
                  ? `TRANSMIT URGENT 5KM RED DISTRESS SIGNAL NOW`
                  : `BROADCAST ${radiusKm.toFixed(1)}KM COMMUNITY AID SIGNAL`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
