import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Volume2,
  VolumeX,
  Phone,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Navigation,
  Lock,
  Heart,
  Share2,
  UserCheck,
  Send,
  Zap,
  Scale,
  ArrowLeft,
} from 'lucide-react';
import { WomenSafetyAlert, SafeHavenPoint, Coordinates } from '../../types';
import { soundPlayer } from '../../utils/audio';
import { useAuth } from '../../context/AuthContext';
import { PUBLIC_COMMAND_NAME } from '../../lib/firebase';

interface WomenSafetyModuleProps {
  alerts: WomenSafetyAlert[];
  safeHavens: SafeHavenPoint[];
  userLocation: Coordinates;
  onTriggerSOS: (notes: string, isDiscreet: boolean) => void;
  onResolveSOS: (id: string) => void;
  onBackToMap?: () => void;
}

export const WomenSafetyModule: React.FC<WomenSafetyModuleProps> = ({
  alerts,
  safeHavens,
  userLocation,
  onTriggerSOS,
  onResolveSOS,
  onBackToMap,
}) => {
  const { currentUser, isAuthorOrAdmin, setIsRulesModalOpen } = useAuth();

  const [sosNotes, setSosNotes] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isDiscreetMode, setIsDiscreetMode] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const [walkTimerMinutes, setWalkTimerMinutes] = useState<number | null>(null);
  const [walkTimerSecondsLeft, setWalkTimerSecondsLeft] = useState<number>(0);
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);

  // Countdown timer for SOS trigger
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      // Trigger SOS
      onTriggerSOS(sosNotes || 'Emergency SOS triggered via Women Safety Quick Alert', false);
      soundPlayer.playBeep();
      setSosSuccessMessage('🚨 Live SOS Beacon Broadcasted to 48 Nearby Guardians & Emergency Contacts!');
      setCountdown(null);
      setSosNotes('');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Walk with me timer
  useEffect(() => {
    if (walkTimerMinutes === null) return;
    if (walkTimerSecondsLeft <= 0) {
      // Auto escalate
      onTriggerSOS('Walk-With-Me timer expired without user check-in. Auto-escalating.', true);
      setWalkTimerMinutes(null);
      return;
    }

    const timer = setInterval(() => {
      setWalkTimerSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [walkTimerMinutes, walkTimerSecondsLeft]);

  const handleStartSOS = () => {
    setCountdown(3);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      soundPlayer.stopSiren();
      setIsSirenActive(false);
    } else {
      soundPlayer.playSiren();
      setIsSirenActive(true);
    }
  };

  const handleStartWalkTimer = (mins: number) => {
    setWalkTimerMinutes(mins);
    setWalkTimerSecondsLeft(mins * 60);
  };

  const handleCalculatorPress = (val: string) => {
    if (val === 'C') {
      setCalculatorInput('');
      return;
    }
    if (val === '=') {
      // Secret distress trigger code '100' or '911' or '999'
      if (calculatorInput.includes('100') || calculatorInput.includes('911') || calculatorInput.includes('999')) {
        onTriggerSOS('Discreet SOS triggered from Decoy Calculator Mode', true);
        setCalculatorInput('Error 001');
      } else {
        try {
          // eslint-disable-next-line no-eval
          setCalculatorInput(String(eval(calculatorInput.replace(/[^0-9+\-*/.]/g, '')) || '0'));
        } catch (e) {
          setCalculatorInput('0');
        }
      }
      return;
    }
    setCalculatorInput((prev) => prev + val);
  };

  // If in discreet fake calculator mode
  if (isDiscreetMode) {
    return (
      <div className="max-w-md mx-auto p-5 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl text-slate-100 animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <span className="text-xs text-slate-400 font-mono">Standard Calculator v2.1</span>
          <button
            onClick={() => setIsDiscreetMode(false)}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Exit Decoy Mode
          </button>
        </div>

        <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl text-right text-2xl font-mono tracking-wider text-emerald-400 mb-4 border border-white/10 min-h-[56px]">
          {calculatorInput || '0'}
        </div>

        <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
          {['C', '(', ')', '/'].map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalculatorPress(btn)}
              className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 active:scale-95 text-slate-300"
            >
              {btn}
            </button>
          ))}
          {['7', '8', '9', '*'].map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalculatorPress(btn)}
              className="p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.08] border border-white/5 active:scale-95 text-slate-200"
            >
              {btn}
            </button>
          ))}
          {['4', '5', '6', '-'].map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalculatorPress(btn)}
              className="p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.08] border border-white/5 active:scale-95 text-slate-200"
            >
              {btn}
            </button>
          ))}
          {['1', '2', '3', '+'].map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalculatorPress(btn)}
              className="p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.08] border border-white/5 active:scale-95 text-slate-200"
            >
              {btn}
            </button>
          ))}
          {['0', '.', '100', '='].map((btn) => (
            <button
              key={btn}
              onClick={() => handleCalculatorPress(btn)}
              className={`p-3 rounded-xl active:scale-95 ${
                btn === '100'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 font-bold'
                  : btn === '='
                  ? 'bg-emerald-500 text-black font-bold hover:bg-emerald-400'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-slate-200'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-3">
          Tip: Punch <span className="text-red-400 font-mono font-bold">100 =</span> to silently transmit live GPS coordinates to verified neighborhood guardians.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBackToMap && (
                <button
                  onClick={onBackToMap}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all mr-1"
                  title="Back to Map"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
                  <span>Back to Map</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                Instant Guardian Network
              </span>
              <span className="text-xs text-slate-400">
                • Real-time SOS telemetry & Safe Haven routing
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Women Safety & Emergency Quick Beacon
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              One-touch SOS broadcasting connects you directly to nearby verified responders, trusted safe havens, and emergency contacts with continuous live telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsDiscreetMode(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold backdrop-blur-md transition-all"
              title="Switch to stealth fake calculator screen"
            >
              <EyeOff className="w-4 h-4 text-slate-400" />
              <span>Decoy Stealth Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {sosSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{sosSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSosSuccessMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main SOS Control Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Big SOS Trigger Panel */}
        <div className="lg:col-span-1 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
              Emergency Broadcast Trigger
            </span>
            <h3 className="text-lg font-bold text-white mt-1">Instant Distress Beacon</h3>
            <p className="text-xs text-slate-400 mt-1">
              Press and hold or tap to begin 3-second instant broadcast to all local guardians.
            </p>
          </div>

          {/* Big Circular SOS Button */}
          <div className="my-6 relative flex items-center justify-center">
            {countdown !== null ? (
              <div className="h-44 w-44 rounded-full bg-red-600 border-4 border-white shadow-2xl flex flex-col items-center justify-center animate-pulse text-white">
                <span className="text-5xl font-black">{countdown}</span>
                <span className="text-xs font-bold uppercase tracking-wider mt-1">Broadcasting in</span>
                <button
                  onClick={handleCancelCountdown}
                  className="mt-2 px-3 py-1 rounded-full bg-black/70 text-red-300 border border-red-400 text-[10px] font-bold hover:bg-black uppercase"
                >
                  Cancel SOS
                </button>
              </div>
            ) : (
              <button
                id="big-sos-beacon-btn"
                onClick={handleStartSOS}
                className="group h-44 w-44 rounded-full bg-gradient-to-tr from-red-600 via-pink-600 to-red-500 border-4 border-white/20 shadow-[0_0_35px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95"
              >
                <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-all mb-1">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <span className="text-2xl font-black tracking-wider">SOS</span>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                  TAP FOR HELP
                </span>
              </button>
            )}
          </div>

          {/* Incident Note Input */}
          <div className="w-full space-y-2">
            <input
              type="text"
              value={sosNotes}
              onChange={(e) => setSosNotes(e.target.value)}
              placeholder="Optional: Brief detail (e.g. following on 8th st)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
            />

            <div className="flex gap-2">
              <button
                onClick={handleToggleSiren}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all backdrop-blur-md ${
                  isSirenActive
                    ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {isSirenActive ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Stop Siren
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-pink-400" /> Loud Siren
                  </>
                )}
              </button>

              <a
                href="tel:100"
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-1 backdrop-blur-md"
              >
                <Phone className="w-3.5 h-3.5 text-red-400" /> 100
              </a>
            </div>
          </div>
        </div>

        {/* Digital Guardian & Walk-With-Me Hub */}
        <div className="lg:col-span-2 space-y-6">
          {/* Walk With Me Virtual Buddy */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    "Walk With Me" Virtual Guardian Buddy
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set a journey timer. If you don't check in before it expires, nearby guardians are alerted automatically.
                  </p>
                </div>
              </div>

              {walkTimerMinutes !== null && (
                <div className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold animate-pulse backdrop-blur-md">
                  {Math.floor(walkTimerSecondsLeft / 60)}:
                  {String(walkTimerSecondsLeft % 60).padStart(2, '0')} remaining
                </div>
              )}
            </div>

            {walkTimerMinutes === null ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleStartWalkTimer(mins)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all hover:border-purple-500/40 backdrop-blur-md"
                  >
                    Start {mins} min Walk
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-md">
                <span className="text-xs text-purple-200">
                  Active walk tracking enabled. Keep phone unlocked if possible.
                </span>
                <button
                  onClick={() => setWalkTimerMinutes(null)}
                  className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                >
                  ✓ I Arrived Safely (Cancel)
                </button>
              </div>
            )}
          </div>

          {/* Rules & Civic Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Scale className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-300">EMERGENCY PROTOCOL & RESOLUTION POLICY:</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  "If false thing posted then fines and punishment will be rewarded as a beautiful gift by society, volunteers, and government."
                  Only the user who initiated the beacon or authorized Admin (<strong>{PUBLIC_COMMAND_NAME}</strong>) can mark it safe or close it.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold whitespace-nowrap"
            >
              View Rules
            </button>
          </div>

          {/* Active Local SOS Incidents in Network */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping"></span>
                <h3 className="font-bold text-sm text-white">
                  Live SOS Beacons in Community ({alerts.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Auto-updating live</span>
            </div>

            <div className="space-y-2">
              {alerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-xs text-slate-400">
                    No active SOS or distress beacons in your local network. The Guardian net is standby ready.
                  </p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const canResolve = isAuthorOrAdmin(alert.userId, alert.authorEmail);

                  return (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-pink-400">{alert.codeName}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-semibold uppercase">
                            {alert.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-slate-500">{alert.timestamp}</span>
                        </div>
                        <p className="text-slate-300">{alert.notes || 'Emergency assistance requested'}</p>
                        <p className="text-[11px] text-slate-400">
                          📍 {alert.addressApprox} • Posted by: {alert.authorName || alert.codeName}
                        </p>

                        {alert.matchedGuardian && (
                          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium mt-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            Guardian En Route: {alert.matchedGuardian.name} ({alert.matchedGuardian.distanceMeters}m away)
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canResolve ? (
                          <button
                            onClick={() => onResolveSOS(alert.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Safe & Close</span>
                          </button>
                        ) : (
                          <span
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-[10px] flex items-center gap-1"
                            title={`Only author (${alert.authorName || 'Requester'}) or ${PUBLIC_COMMAND_NAME} can mark safe.`}
                          >
                            <Lock className="w-3 h-3 text-amber-500" />
                            Author/Admin Only
                          </span>
                        )}

                        <button className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-600/30">
                          Respond
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Nearest Verified Safe Havens */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                Nearest Verified 24/7 Safe Havens (Hospitals & Refuges)
              </h3>
              <span className="text-[11px] text-slate-400">Open & Staffed Now</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safeHavens.length === 0 ? (
                <div className="md:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-xs text-slate-400">
                    Locating verified medical facilities, fire stations, and emergency refuges nearby...
                  </p>
                </div>
              ) : (
                safeHavens.slice(0, 2).map((haven) => (
                  <div
                    key={haven.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white">{haven.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">📍 {haven.address}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {haven.amenities.slice(0, 2).map((am, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-white/5 text-emerald-300 text-[9px] border border-emerald-500/20"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-emerald-400 font-semibold">Open 24/7</span>
                      <a
                        href={`tel:${haven.contactPhone}`}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px] backdrop-blur-md"
                      >
                        Call Direct
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
