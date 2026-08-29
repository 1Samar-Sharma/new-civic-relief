import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Volume2,
  VolumeX,
  Phone,
  UserCheck,
  CheckCircle,
  Share2,
  Clock,
  Radio,
  Lock,
} from 'lucide-react';
import { Coordinates } from '../types';
import { soundPlayer } from '../utils/audio';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: Coordinates;
  onConfirmSOS: (notes: string) => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onConfirmSOS,
}) => {
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [notes, setNotes] = useState('Emergency SOS triggered from global command bar');
  const [dispatchedGuardians, setDispatchedGuardians] = useState([
    { name: 'Elena Rostova (CPR / Verified Guardian)', distance: '140m', eta: '2 mins', phone: '+1 (555) 918-2201' },
    { name: 'Marcus Chen (4x4 Transport / Paramedic)', distance: '450m', eta: '5 mins', phone: '+1 (555) 882-0199' },
    { name: 'Officer Bradley (Ret. Community Lead)', distance: '620m', eta: '7 mins', phone: '+1 (555) 439-0112' },
  ]);

  if (!isOpen) return null;

  const handleToggleSiren = () => {
    if (isSirenOn) {
      soundPlayer.stopSiren();
      setIsSirenOn(false);
    } else {
      soundPlayer.playSiren();
      setIsSirenOn(true);
    }
  };

  const handleCancelAndClose = () => {
    soundPlayer.stopSiren();
    setIsSirenOn(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#050810]/95 backdrop-blur-2xl border-2 border-rose-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-rose-950/60 space-y-5 animate-fadeIn text-xs">
        {/* Urgent Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-600 border-2 border-white/80 shadow-xl shadow-rose-600/30 flex items-center justify-center text-white animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-rose-400 tracking-tight">
                  ACTIVE DISTRESS BEACON
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 text-[10px] font-extrabold animate-pulse">
                  BROADCASTING
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Live location streaming to 48 nearby verified guardians & emergency services
              </p>
            </div>
          </div>
        </div>

        {/* GPS Live Telemetry Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Locked Coordinates:
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (Accurate to 3m)
            </span>
          </div>
          <p className="text-slate-200 font-medium">
            📍 Corner of 8th St & Market Ave Corridor (Near Central Transit Plaza)
          </p>
        </div>

        {/* Action Buttons: Siren + Direct 911 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleToggleSiren}
            className={`py-3.5 rounded-2xl border font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSirenOn
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-rose-600/30'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/10'
            }`}
          >
            {isSirenOn ? (
              <>
                <VolumeX className="w-5 h-5" /> STOP SIREN
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-rose-400" /> AUDIBLE SIREN
              </>
            )}
          </button>

          <a
            href="tel:911"
            className="py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 transition-all"
          >
            <Phone className="w-5 h-5 text-rose-400" /> CALL 911 DIRECT
          </a>
        </div>

        {/* Nearby Guardians Responding */}
        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-purple-400" />
              Nearby Community Guardians En Route (3):
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">Live GPS Tracker</span>
          </div>

          <div className="space-y-2">
            {dispatchedGuardians.map((g, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs">{g.name}</span>
                  <p className="text-[11px] text-purple-300">
                    {g.distance} away • Arriving in ~{g.eta}
                  </p>
                </div>
                <a
                  href={`tel:${g.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[11px] font-bold transition-all"
                >
                  Call
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note Input */}
        <div className="space-y-1.5">
          <label className="block text-slate-400 font-semibold text-[11px]">
            Live Incident Note (Transmitted to Responders):
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Cancel Safety Deactivation */}
        <div className="pt-2">
          <button
            onClick={handleCancelAndClose}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4" /> I AM SAFE (DEACTIVATE BEACON)
          </button>
        </div>
      </div>
    </div>
  );
};
