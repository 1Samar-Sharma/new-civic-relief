import React, { useState } from 'react';
import {
  Radio,
  Waves,
  Mountain,
  Activity,
  CloudRain,
  AlertTriangle,
  Languages,
  CheckSquare,
  Square,
  Printer,
  Sparkles,
  ShieldCheck,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { DisasterAlert } from '../../types';
import { DisasterActivityTrendChart } from './DisasterActivityTrendChart';

interface EarlyWarningModuleProps {
  alerts: DisasterAlert[];
  onTranslateAlert: (message: string, languages: string[]) => Promise<any>;
  onOpenWeatherGPT?: () => void;
  onBackToMap?: () => void;
}

export const EarlyWarningModule: React.FC<EarlyWarningModuleProps> = ({
  alerts,
  onTranslateAlert,
  onOpenWeatherGPT,
  onBackToMap,
}) => {
  const [activeHazardTab, setActiveHazardTab] = useState<'flood' | 'landslide' | 'earthquake' | 'storm'>(
    'flood'
  );

  const [checklist, setChecklist] = useState<{ id: string; label: string; checked: boolean }[]>([
    { id: '1', label: '1 Gallon water per person/pet per day for 3 days minimum', checked: true },
    { id: '2', label: '72-Hour non-perishable food rations & manual can opener', checked: true },
    { id: '3', label: 'Emergency NOAA weather radio (hand crank or battery powered)', checked: false },
    { id: '4', label: 'Flashlight, extra high-capacity batteries & solar power bank', checked: true },
    { id: '5', label: 'First-aid trauma kit, prescription medications & N95 masks', checked: false },
    { id: '6', label: 'Copies of critical IDs, insurance policies & cash in waterproof bag', checked: false },
    { id: '7', label: 'Wrench/pliers to turn off home gas lines & main water breaker', checked: false },
  ]);

  const [broadcastInput, setBroadcastInput] = useState(
    'URGENT: Flash flood warning in Lower Mill Creek basin. Water has surpassed levee by +0.35m. Avoid Mill Road. Move to upper levels or Valley Gym shelter.'
  );
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleTranslate = async () => {
    if (!broadcastInput) return;
    setIsTranslating(true);
    try {
      const res = await onTranslateAlert(broadcastInput, ['es', 'hi', 'fr', 'zh', 'ar']);
      if (res && res.translations) {
        setTranslations(res.translations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

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
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>Back to Map</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                Multi-Hazard Sensor Array
              </span>
              <span className="text-xs text-slate-400">
                • Continuous Hydrological, Geological & Seismic Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Upcoming Disaster Early Warning & Preparedness
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Proactive community warnings for flash floods, mudslides, earthquakes, and severe storms with real-time sensor gauges and multilingual alert broadcasting.
            </p>
          </div>

          {/* Quick Hazard Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveHazardTab('flood')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeHazardTab === 'flood'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Waves className="w-3.5 h-3.5" /> Floods
            </button>
            <button
              onClick={() => setActiveHazardTab('landslide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeHazardTab === 'landslide'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" /> Landslides
            </button>
            <button
              onClick={() => setActiveHazardTab('earthquake')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeHazardTab === 'earthquake'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Quakes
            </button>
            <button
              onClick={() => setActiveHazardTab('storm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeHazardTab === 'storm'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" /> Storms
            </button>
          </div>
        </div>
      </div>

      {/* WeatherGPT AI Meteorological Radar Link Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/50 via-slate-900/60 to-indigo-950/50 border border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">WeatherGPT Conversational Forecast Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                AI Active
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Ask AI about 24h precipitation, heat stress, red-flag wildfire winds, and localized flash flood runoffs.
            </p>
          </div>
        </div>

        {onOpenWeatherGPT && (
          <button
            onClick={onOpenWeatherGPT}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch WeatherGPT
          </button>
        )}
      </div>

      {/* Hazard Telemetry Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Gauge Display */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          {activeHazardTab === 'flood' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Mill Creek Hydrological Basin Gauge #12
                    </h3>
                    <p className="text-xs text-slate-400">
                      Downstream flow rate: 420 m³/s • Elevation: 14m ASL
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase">
                  Flood Stage Active
                </span>
              </div>

              {/* Water Level Bar */}
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Gauge Reading:</span>
                  <span className="font-extrabold text-cyan-400 text-sm">
                    4.85 meters (+0.35m over 4.50m Flood Crest)
                  </span>
                </div>
                <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden relative">
                  {/* Warning line marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: '75%' }}
                    title="Flood Crest Threshold (4.50m)"
                  />
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-red-600 rounded-full transition-all duration-1000"
                    style={{ width: '84%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Normal (1.5m)</span>
                  <span>Advisory (3.0m)</span>
                  <span className="text-red-400 font-bold">Flood Levee Crest (4.5m)</span>
                  <span className="text-cyan-400 font-bold">Current (4.85m)</span>
                </div>
              </div>

              {/* Flood Action Protocols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-cyan-300 font-bold">🌊 Vertical Evacuation</span>
                  <p className="text-slate-400 text-[11px]">
                    If water enters ground floor, immediately move elderly and pets to 2nd story or attic with rooftop egress tool.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-cyan-300 font-bold">⚡ Electrical Safety</span>
                  <p className="text-slate-400 text-[11px]">
                    Do not touch breaker panels or appliances standing in water. Treat all murky standing puddles as potentially electrified.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeHazardTab === 'landslide' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Pine Crest Geological Slope Stability Sensor
                    </h3>
                    <p className="text-xs text-slate-400">
                      Inclinometer Axis X/Y: +1.4° tilt • Subsurface moisture: 94%
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase">
                  Slip Warning
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Soil Saturation</span>
                  <p className="text-xl font-black text-amber-400 mt-1">94%</p>
                  <span className="text-[10px] text-red-400">Liquefaction threshold near</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Micro-Tremors</span>
                  <p className="text-xl font-black text-purple-400 mt-1">14 / hr</p>
                  <span className="text-[10px] text-slate-400">Subsurface shear detected</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-slate-400">Cut-off Corridors</span>
                  <p className="text-xl font-black text-red-400 mt-1">2 Roads</p>
                  <span className="text-[10px] text-slate-400">Upper Switchback bypass</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl backdrop-blur-md">
                ⚠️ Warning: Mountain switchbacks 2 through 5 are at high risk of mudflow debris. If cracking is noticed in foundations or driveways, evacuate toward Valley Safe Haven immediately.
              </p>
            </div>
          )}

          {activeHazardTab === 'earthquake' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Seismic Faultline Tremor Monitor (Station SV-09)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time P-Wave Early Detection Network
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase">
                  Baseline Normal (M 1.2)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  During Active Shaking: Drop, Cover, and Hold On!
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-purple-400 block mb-1">1. DROP</span>
                    Drop down onto your hands and knees to prevent being knocked over.
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-purple-400 block mb-1">2. COVER</span>
                    Cover your head and neck under a sturdy table or desk.
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-purple-400 block mb-1">3. HOLD ON</span>
                    Hold on to your shelter until the shaking completely stops.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeHazardTab === 'storm' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Atmospheric River & Cyclone Radar (Barometric 988 hPa)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Precipitation rate: 22 mm/hr • Peak wind gusts: 65 km/h
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold uppercase">
                  Severe Gale Watch
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-slate-300 backdrop-blur-md">
                Heavy squall line approaching from the northwest. Secure loose outdoor furniture, clear gutter downspouts, and charge all power banks before projected grid brownouts.
              </div>
            </div>
          )}
        </div>

        {/* 72-Hour Preparedness Checklist */}
        <div className="lg:col-span-1 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                Home Resilience
              </span>
              <h3 className="text-base font-bold text-white">72-Hour Go-Bag Checklist</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {checklist.filter((c) => c.checked).length}/{checklist.length} Ready
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  item.checked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={item.checked ? 'line-through text-slate-400' : ''}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all backdrop-blur-md"
            >
              <Printer className="w-3.5 h-3.5" /> Print Emergency Family Card
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Disaster Activity Trend Chart (Recharts) */}
      <DisasterActivityTrendChart alerts={alerts} />

      {/* Live Verified Disaster Alerts Feed (USGS, NOAA, ReliefWeb) */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="font-bold text-sm sm:text-base text-white">
              Live Verified Disaster Telemetry Feed
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
              USGS • NOAA • ReliefWeb
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} in sector
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-slate-200 text-sm">No current alerts</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All active geological, meteorological, and crisis feeds report normal conditions in this geographic perimeter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-xs truncate">{alert.title}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : alert.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{alert.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>Source: <strong className="text-slate-300">{alert.source}</strong></span>
                  <span>{alert.locationName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multilingual Emergency Alert Broadcast Translator (Gemini Powered) */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Multilingual Emergency Broadcast Generator (AI-Powered)
              </h3>
              <p className="text-xs text-slate-400">
                Ensure every neighbor in diverse linguistic communities receives lifesaving evacuation notices in their native language.
              </p>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isTranslating ? 'Translating via Gemini...' : 'Translate to 5 Languages'}
          </button>
        </div>

        <textarea
          rows={2}
          value={broadcastInput}
          onChange={(e) => setBroadcastInput(e.target.value)}
          placeholder="Enter emergency message to translate..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />

        {translations && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1 animate-fadeIn">
            {Object.entries(translations).map(([lang, text]) => (
              <div
                key={lang}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
              >
                <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold uppercase">
                  <span>
                    {lang === 'es' && '🇪🇸 Spanish (Español)'}
                    {lang === 'hi' && '🇮🇳 Hindi (हिन्दी)'}
                    {lang === 'fr' && '🇫🇷 French (Français)'}
                    {lang === 'zh' && '🇨🇳 Mandarin (中文)'}
                    {lang === 'ar' && '🇸🇦 Arabic (العربية)'}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(text))}
                    className="text-slate-400 hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
