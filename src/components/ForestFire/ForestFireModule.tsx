import React, { useState } from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  MapPin,
  Send,
  AlertTriangle,
  Users,
  Compass,
  CheckCircle,
  Truck,
  Sparkles,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { DisasterAlert, Coordinates } from '../../types';

interface ForestFireModuleProps {
  alerts: DisasterAlert[];
  userLocation: Coordinates;
  onSubmitFireReport: (report: {
    title: string;
    locationName: string;
    description: string;
    smokeDensity: 'light' | 'moderate' | 'heavy_black';
    lat: number;
    lng: number;
  }) => void;
  onAnalyzeWithAI: (title: string, desc: string) => Promise<any>;
  onBackToMap?: () => void;
}

export const ForestFireModule: React.FC<ForestFireModuleProps> = ({
  alerts,
  userLocation,
  onSubmitFireReport,
  onAnalyzeWithAI,
  onBackToMap,
}) => {
  const fireAlerts = alerts.filter((a) => a.category === 'wildfire');
  const primaryFire = fireAlerts[0];

  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('East Ridge Switchback (near trail 4)');
  const [reportDesc, setReportDesc] = useState('');
  const [smokeDensity, setSmokeDensity] = useState<'light' | 'moderate' | 'heavy_black'>('moderate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRunAIAnalysis = async () => {
    if (!reportTitle && !reportDesc) return;
    setIsAnalyzing(true);
    try {
      const res = await onAnalyzeWithAI(
        reportTitle || 'Forest Fire Smoke Spotting',
        reportDesc || `Smoke density observed: ${smokeDensity} at ${reportLocation}`
      );
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDesc) return;
    setIsSubmitting(true);

    onSubmitFireReport({
      title: reportTitle,
      locationName: reportLocation,
      description: reportDesc,
      smokeDensity,
      lat: userLocation.lat + (Math.random() * 0.008 - 0.004),
      lng: userLocation.lng + (Math.random() * 0.008 - 0.004),
    });

    setSuccessMsg('🔥 Flare-up report dispatched to neighborhood fire teams & watch drone!');
    setReportTitle('');
    setReportDesc('');
    setAiAnalysis(null);
    setIsSubmitting(false);
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
                  <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
                  <span>Back to Map</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                Active Fire Watch Radar
              </span>
              <span className="text-xs text-slate-400">
                • Continuous Thermal Satellite & Community Drone Sweeps
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Forest Fire Detection & Early Warning System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Track wildfire perimeter expansion, live wind vectors, evacuation readiness tiers, and coordinate local firebreak defense crews in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Evac Tier</span>
              <p className={`text-sm font-extrabold ${primaryFire ? 'text-orange-400' : 'text-emerald-400'}`}>
                {primaryFire
                  ? primaryFire.severity === 'critical'
                    ? 'LEVEL 3 (GO)'
                    : primaryFire.severity === 'high'
                    ? 'LEVEL 2 (SET)'
                    : 'LEVEL 1 (READY)'
                  : 'NORMAL'}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Active Fires</span>
              <p className={`text-sm font-extrabold ${fireAlerts.length > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                {fireAlerts.length} in Area
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Air Hazard</span>
              <p className={`text-sm font-extrabold ${primaryFire ? 'text-purple-400' : 'text-emerald-400'}`}>
                {primaryFire?.hazardMetrics?.aqiIndex ? `${primaryFire.hazardMetrics.aqiIndex} AQI` : 'Optimal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fire Telemetry & Evacuation Protocol */}
        <div className="lg:col-span-2 space-y-6">
          {!primaryFire && (
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Active Wildfires Detected in Sector</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Live USGS, NOAA, and satellite thermal telemetry feeds report baseline conditions around your coordinates. If you observe smoke, ash fallout, or spot flames, submit an immediate report using the form.
              </p>
            </div>
          )}
          {/* Active Fire Profile Card */}
          {primaryFire && (
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                    <h3 className="font-bold text-base text-white">{primaryFire.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    📍 {primaryFire.locationName} • Updated {primaryFire.timestamp}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase self-start sm:self-auto">
                  Critical Hazard
                </span>
              </div>

              {/* Weather & Hazard Sensor Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>Wind Gusts</span>
                  </div>
                  <p className="text-base font-extrabold text-white mt-1">
                    {primaryFire.hazardMetrics?.windSpeedKmh} km/h
                  </p>
                  <span className="text-[10px] text-orange-400 font-semibold">
                    {primaryFire.hazardMetrics?.windDirection}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <span>Ambient Temp</span>
                  </div>
                  <p className="text-base font-extrabold text-white mt-1">
                    {primaryFire.hazardMetrics?.temperatureC}°C
                  </p>
                  <span className="text-[10px] text-slate-400">Extreme Heat</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span>Fuel Humidity</span>
                  </div>
                  <p className="text-base font-extrabold text-white mt-1">
                    {primaryFire.hazardMetrics?.humidityPct}%
                  </p>
                  <span className="text-[10px] text-red-400 font-semibold">Critically Dry</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    <span>Air Hazard (AQI)</span>
                  </div>
                  <p className="text-base font-extrabold text-purple-300 mt-1">
                    {primaryFire.hazardMetrics?.aqiIndex}
                  </p>
                  <span className="text-[10px] text-purple-400 font-semibold">Very Unhealthy</span>
                </div>
              </div>

              {/* Spread Simulation Vector */}
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-300 uppercase text-[11px]">
                    Projected Fire Spread Direction
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Radar Model v4.8</span>
                </div>
                <p className="text-slate-300">
                  Winds blowing ENE are pushing embers across the Skyline Ridge line at an estimated rate of 420m/hour. Zone B residents should prepare for zero-visibility road conditions.
                </p>
              </div>

              {/* Recommended Steps */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Immediate Evacuation & Home Hardening Directives:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {primaryFire.recommendedActions.map((action, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2"
                    >
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="text-slate-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Firebreak & Volunteer Water Staging Points */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" />
                Community Firebreak & Water Tanker Staging Stations
              </h3>
              <span className="text-[11px] text-slate-400">3 Active Units</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-orange-400 font-bold">Station Alpha (Water Depot)</span>
                <p className="text-slate-400 text-[11px]">📍 780 Industrial Pkwy</p>
                <p className="text-emerald-400 text-[11px] font-semibold">10,000 Gallons Available</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-orange-400 font-bold">Firebreak Crew Bravo</span>
                <p className="text-slate-400 text-[11px]">📍 Skyline Blvd Mile 4</p>
                <p className="text-blue-400 text-[11px] font-semibold">8 Chainsaws & 4WD Trucks</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-orange-400 font-bold">Animal Evac Trailer</span>
                <p className="text-slate-400 text-[11px]">📍 West Valley Gym</p>
                <p className="text-amber-400 text-[11px] font-semibold">Horses & Livestock Staging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spot-Fire & Smoke Quick Reporting Form */}
        <div className="lg:col-span-1 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-orange-400 tracking-wider">
              Crowdsourced Early Warning
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Report Spot Fire or Smoke</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your instant report alerts nearby neighbors and dispatches volunteer spotters before brush spreads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">What are you seeing?</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g., Embers igniting brush behind switchback"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Approximate Location</label>
              <input
                type="text"
                value={reportLocation}
                onChange={(e) => setReportLocation(e.target.value)}
                placeholder="Street name, landmark, or trail marker"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Observed Smoke Density</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'light', label: 'White / Light' },
                  { key: 'moderate', label: 'Gray / Dense' },
                  { key: 'heavy_black', label: 'Thick Black' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => setSmokeDensity(s.key as any)}
                    className={`py-2 px-1 rounded-xl text-center font-semibold border transition-all text-[11px] ${
                      smokeDensity === s.key
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-md'
                        : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.08]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Incident Notes / Details</label>
              <textarea
                rows={3}
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Describe flame height, spreading direction, structures threatened, or trapped neighbors..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* AI Hazard Assessment Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing || (!reportTitle && !reportDesc)}
                className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all backdrop-blur-md disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Hazard with AI'}
              </button>
            </div>

            {/* AI Analysis Preview */}
            {aiAnalysis && (
              <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs space-y-2 backdrop-blur-md animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">AI Risk Assessment</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-bold text-[10px] border border-purple-500/40">
                    Risk: {aiAnalysis.riskScore}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Est. Danger Radius: {aiAnalysis.dangerRadiusMeters}m
                </p>
                {aiAnalysis.recommendedActions && (
                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                    {aiAnalysis.recommendedActions.slice(0, 2).map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-black font-bold text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast Fire Alert to Community
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
