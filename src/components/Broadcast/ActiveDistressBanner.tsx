import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  MapPin,
  Volume2,
  VolumeX,
  CheckCircle,
  Users,
  Shield,
  Phone,
  Clock,
  Compass
} from 'lucide-react';
import { Coordinates } from '../../types';
import { soundPlayer } from '../../utils/audio';
import { BroadcastSignalData } from './BroadcastSignalModal';

interface ActiveDistressBannerProps {
  signal: BroadcastSignalData | null;
  onCancelSignal?: () => void;
  onDeactivate?: () => void;
  onFocusMap?: () => void;
  onOpenSignalDetails?: () => void;
}

export const ActiveDistressBanner: React.FC<ActiveDistressBannerProps> = ({
  signal,
  onCancelSignal,
  onDeactivate,
  onFocusMap,
  onOpenSignalDetails,
}) => {
  const [isSirenActive, setIsSirenActive] = useState(false);

  if (!signal) return null;

  const handleStop = () => {
    soundPlayer.stopSiren();
    if (onCancelSignal) onCancelSignal();
    if (onDeactivate) onDeactivate();
  };

  const handleFocus = () => {
    if (onFocusMap) onFocusMap();
    if (onOpenSignalDetails) onOpenSignalDetails();
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      soundPlayer.stopSiren();
      setIsSirenActive(false);
    } else {
      soundPlayer.playSiren();
      setIsSirenActive(true);
    }
  };

  const isUrgent = signal.isUrgentRedAlert || signal.urgency === 'critical_urgent';

  return (
    <div
      className={`w-full border-b backdrop-blur-2xl transition-all relative z-30 px-3 sm:px-6 py-2.5 ${
        isUrgent
          ? 'bg-red-950/80 border-red-500/50 shadow-[0_4px_25px_rgba(239,68,68,0.4)]'
          : 'bg-blue-950/80 border-blue-500/50 shadow-[0_4px_20px_rgba(59,130,246,0.3)]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white flex-shrink-0 animate-bounce ${
              isUrgent ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.8)]'
            }`}
          >
            {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-xs sm:text-sm tracking-tight ${
                  isUrgent ? 'text-red-300' : 'text-blue-300'
                }`}
              >
                {isUrgent ? '🚨 ACTIVE 5KM URGENT RED DISTRESS SIGNAL' : '📡 ACTIVE 5KM COMMUNITY AID SIGNAL'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold border border-white/20 animate-pulse">
                BROADCASTING
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-lg">
              <span className="font-semibold text-white">{signal.title}</span> • {signal.address}
            </p>
          </div>
        </div>

        {/* Telemetry Chips & Action Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong className="text-white">{signal.peopleReached || 64}</strong> Reached ({signal.radiusKm || 5}km radius)
            </span>
          </div>

          <button
            onClick={toggleSiren}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSirenActive
                ? 'bg-red-600 text-white border-red-400 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
            }`}
            title="Toggle siren"
          >
            {isSirenActive ? (
              <>
                <VolumeX className="w-3.5 h-3.5" /> Siren ON
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-400" /> Siren
              </>
            )}
          </button>

          <button
            onClick={handleStop}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" /> I AM SAFE (CANCEL)
          </button>
        </div>
      </div>
    </div>
  );
};
