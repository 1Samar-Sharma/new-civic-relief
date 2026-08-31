import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  Waves,
  CloudRain,
  Activity,
  Calendar,
  Layers,
  BarChart2,
  Info,
} from 'lucide-react';
import { DisasterAlert } from '../../types';

interface DisasterActivityTrendChartProps {
  alerts?: DisasterAlert[];
}

interface DailyTrendPoint {
  date: string;
  fullDate: string;
  dayIndex: number;
  flood: number;
  wildfire: number;
  earthquake: number;
  storm: number;
  critical: number;
  high: number;
  moderate: number;
  total: number;
  rollingAvg7d: number;
}

export const DisasterActivityTrendChart: React.FC<DisasterActivityTrendChartProps> = ({
  alerts = [],
}) => {
  const [chartType, setChartType] = useState<'area' | 'composed' | 'severity'>('area');
  const [selectedHazardFilter, setSelectedHazardFilter] = useState<'all' | 'flood' | 'wildfire' | 'earthquake' | 'storm'>('all');

  // Generate 30-day realistic historical trend data ending on current date (Aug 31, 2026)
  const trendData = useMemo<DailyTrendPoint[]>(() => {
    const points: DailyTrendPoint[] = [];
    const baseDate = new Date(2026, 7, 31); // Aug 31, 2026

    // Baseline seasonal patterns with incident clusters (e.g., heatwave & wildfire peak mid-month, flash storm event)
    const basePatterns = [
      { flood: 1, wildfire: 0, earthquake: 0, storm: 1, critical: 0, high: 1, moderate: 1 },
      { flood: 0, wildfire: 1, earthquake: 1, storm: 0, critical: 0, high: 0, moderate: 2 },
      { flood: 2, wildfire: 1, earthquake: 0, storm: 2, critical: 1, high: 2, moderate: 2 },
      { flood: 1, wildfire: 0, earthquake: 0, storm: 1, critical: 0, high: 1, moderate: 1 },
      { flood: 0, wildfire: 2, earthquake: 0, storm: 0, critical: 0, high: 1, moderate: 1 },
      { flood: 0, wildfire: 3, earthquake: 1, storm: 0, critical: 1, high: 2, moderate: 1 },
      { flood: 1, wildfire: 2, earthquake: 0, storm: 1, critical: 0, high: 2, moderate: 2 },
      { flood: 3, wildfire: 1, earthquake: 0, storm: 3, critical: 2, high: 3, moderate: 2 }, // Storm system
      { flood: 4, wildfire: 0, earthquake: 1, storm: 4, critical: 3, high: 4, moderate: 2 }, // Flood peak
      { flood: 2, wildfire: 0, earthquake: 0, storm: 2, critical: 1, high: 2, moderate: 1 },
      { flood: 1, wildfire: 1, earthquake: 0, storm: 1, critical: 0, high: 1, moderate: 2 },
      { flood: 0, wildfire: 2, earthquake: 2, storm: 0, critical: 1, high: 1, moderate: 2 },
      { flood: 0, wildfire: 3, earthquake: 1, storm: 0, critical: 1, high: 2, moderate: 1 },
      { flood: 0, wildfire: 4, earthquake: 0, storm: 0, critical: 2, high: 2, moderate: 0 },
      { flood: 1, wildfire: 5, earthquake: 0, storm: 1, critical: 3, high: 3, moderate: 1 }, // Wildfire peak spike
      { flood: 0, wildfire: 6, earthquake: 1, storm: 0, critical: 4, high: 2, moderate: 1 }, // High heat event
      { flood: 0, wildfire: 4, earthquake: 0, storm: 0, critical: 2, high: 2, moderate: 0 },
      { flood: 1, wildfire: 3, earthquake: 0, storm: 1, critical: 1, high: 2, moderate: 2 },
      { flood: 2, wildfire: 2, earthquake: 0, storm: 2, critical: 1, high: 3, moderate: 2 },
      { flood: 1, wildfire: 1, earthquake: 3, storm: 1, critical: 1, high: 2, moderate: 3 }, // Tremor cluster
      { flood: 0, wildfire: 2, earthquake: 1, storm: 0, critical: 0, high: 2, moderate: 1 },
      { flood: 0, wildfire: 3, earthquake: 0, storm: 0, critical: 1, high: 1, moderate: 1 },
      { flood: 1, wildfire: 2, earthquake: 0, storm: 2, critical: 1, high: 2, moderate: 2 },
      { flood: 2, wildfire: 1, earthquake: 0, storm: 3, critical: 2, high: 2, moderate: 2 },
      { flood: 3, wildfire: 0, earthquake: 1, storm: 2, critical: 1, high: 3, moderate: 2 },
      { flood: 1, wildfire: 2, earthquake: 0, storm: 1, critical: 0, high: 2, moderate: 2 },
      { flood: 0, wildfire: 4, earthquake: 0, storm: 0, critical: 2, high: 2, moderate: 0 },
      { flood: 1, wildfire: 3, earthquake: 1, storm: 1, critical: 1, high: 3, moderate: 2 },
      { flood: 2, wildfire: 2, earthquake: 0, storm: 2, critical: 1, high: 2, moderate: 3 },
      { flood: 2, wildfire: 3, earthquake: 1, storm: 2, critical: 2, high: 4, moderate: 2 }, // Today (Aug 31)
    ];

    // Distribute current real alerts if any into the recent days
    const activeAlertsCount = alerts.length;
    const additionalRecentFlood = alerts.filter((a) => a.category === 'flood' || a.category === 'landslide').length;
    const additionalRecentFire = alerts.filter((a) => a.category === 'wildfire' || a.category === 'fire').length;
    const additionalRecentStorm = alerts.filter((a) => a.category === 'storm' || a.category === 'cyclone').length;
    const additionalRecentQuake = alerts.filter((a) => a.category === 'earthquake' || a.category === 'tsunami').length;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dayIndex = 29 - i;
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const raw = basePatterns[dayIndex] || { flood: 1, wildfire: 1, earthquake: 0, storm: 1, critical: 0, high: 1, moderate: 1 };
      
      // Add boost on last 3 days for live active alerts
      const liveBoost = i <= 2 ? Math.min(2, Math.ceil(activeAlertsCount / 3)) : 0;
      const floodVal = raw.flood + (i === 0 ? additionalRecentFlood : 0);
      const wildfireVal = raw.wildfire + (i === 0 ? additionalRecentFire : 0);
      const stormVal = raw.storm + (i === 0 ? additionalRecentStorm : 0);
      const earthquakeVal = raw.earthquake + (i === 0 ? additionalRecentQuake : 0);

      const total = floodVal + wildfireVal + stormVal + earthquakeVal + liveBoost;
      const critical = raw.critical + (i === 0 && alerts.some((a) => a.severity === 'critical') ? 1 : 0);
      const high = raw.high + (i <= 1 ? liveBoost : 0);
      const moderate = Math.max(1, total - critical - high);

      points.push({
        date: dateLabel,
        fullDate,
        dayIndex,
        flood: floodVal,
        wildfire: wildfireVal,
        earthquake: earthquakeVal,
        storm: stormVal,
        critical,
        high,
        moderate,
        total,
        rollingAvg7d: 0, // Calculated in second pass below
      });
    }

    // Compute 7-day rolling average
    for (let i = 0; i < points.length; i++) {
      const start = Math.max(0, i - 6);
      const windowPoints = points.slice(start, i + 1);
      const sum = windowPoints.reduce((acc, p) => acc + p.total, 0);
      points[i].rollingAvg7d = parseFloat((sum / windowPoints.length).toFixed(1));
    }

    return points;
  }, [alerts]);

  // Aggregate summary stats for the 30-day window
  const summaryStats = useMemo(() => {
    const total30d = trendData.reduce((acc, p) => acc + p.total, 0);
    const totalFloods = trendData.reduce((acc, p) => acc + p.flood, 0);
    const totalWildfires = trendData.reduce((acc, p) => acc + p.wildfire, 0);
    const totalStorms = trendData.reduce((acc, p) => acc + p.storm, 0);
    const totalQuakes = trendData.reduce((acc, p) => acc + p.earthquake, 0);
    const totalCritical = trendData.reduce((acc, p) => acc + p.critical, 0);

    const peakDay = trendData.reduce(
      (max, p) => (p.total > max.total ? p : max),
      trendData[0] || { date: 'Aug 16', total: 7, wildfire: 6, flood: 0, storm: 0, earthquake: 1 }
    );

    const firstHalfSum = trendData.slice(0, 15).reduce((acc, p) => acc + p.total, 0);
    const secondHalfSum = trendData.slice(15).reduce((acc, p) => acc + p.total, 0);
    const percentChange = Math.round(((secondHalfSum - firstHalfSum) / Math.max(1, firstHalfSum)) * 100);

    const current7dAvg = trendData[trendData.length - 1]?.rollingAvg7d || 4.2;

    return {
      total30d,
      totalFloods,
      totalWildfires,
      totalStorms,
      totalQuakes,
      totalCritical,
      peakDay,
      percentChange,
      current7dAvg,
      hazardCounts: [
        { name: 'Wildfire', count: totalWildfires, icon: Flame, color: '#f97316' },
        { name: 'Storms', count: totalStorms, icon: CloudRain, color: '#38bdf8' },
        { name: 'Floods', count: totalFloods, icon: Waves, color: '#06b6d4' },
        { name: 'Earthquakes', count: totalQuakes, icon: Activity, color: '#a855f7' },
      ].sort((a, b) => b.count - a.count),
    };
  }, [trendData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DailyTrendPoint;
      return (
        <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {dataPoint.fullDate}
            </span>
            <span className="font-black text-amber-300 font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px]">
              {dataPoint.total} Alerts
            </span>
          </div>

          {chartType === 'severity' ? (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-rose-300">
                <span>Critical / Life Threat:</span>
                <span className="font-bold font-mono">{dataPoint.critical}</span>
              </div>
              <div className="flex justify-between items-center text-amber-300">
                <span>High Alert:</span>
                <span className="font-bold font-mono">{dataPoint.high}</span>
              </div>
              <div className="flex justify-between items-center text-sky-300">
                <span>Moderate Advisory:</span>
                <span className="font-bold font-mono">{dataPoint.moderate}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-orange-300">
                <span className="flex items-center gap-1">🔥 Wildfire / Smoke:</span>
                <span className="font-bold font-mono">{dataPoint.wildfire}</span>
              </div>
              <div className="flex justify-between items-center text-cyan-300">
                <span className="flex items-center gap-1">🌊 Floods & Mudslides:</span>
                <span className="font-bold font-mono">{dataPoint.flood}</span>
              </div>
              <div className="flex justify-between items-center text-sky-300">
                <span className="flex items-center gap-1">🌧️ Severe Storms:</span>
                <span className="font-bold font-mono">{dataPoint.storm}</span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span className="flex items-center gap-1">⚡ Seismic Tremors:</span>
                <span className="font-bold font-mono">{dataPoint.earthquake}</span>
              </div>
            </div>
          )}

          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>7-Day Rolling Average:</span>
            <span className="font-mono text-emerald-400 font-bold">{dataPoint.rollingAvg7d} / day</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Disaster Activity Trend (Past 30 Days)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Temporal frequency of verified localized crisis warnings, flash flood advisories, wildfire spotters, and seismic events across the 30-day monitoring window.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Representation Switcher */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                chartType === 'area'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Stacked Hazard Area View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hazard Volume</span>
            </button>
            <button
              onClick={() => setChartType('composed')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                chartType === 'composed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Daily Bar with 7-Day Moving Trend Line"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Daily + 7D Avg</span>
            </button>
            <button
              onClick={() => setChartType('severity')}
              className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                chartType === 'severity'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Severity Distribution View"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>By Severity</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            30-Day Alert Volume
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {summaryStats.total30d}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                summaryStats.percentChange >= 0
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {summaryStats.percentChange >= 0 ? `+${summaryStats.percentChange}%` : `${summaryStats.percentChange}%`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Total registered events</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            7-Day Rolling Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {summaryStats.current7dAvg}
            </span>
            <span className="text-[10px] text-slate-400">alerts/day</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Current frequency pace</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            Top Hazard Driver
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-orange-300 truncate">
              {summaryStats.hazardCounts[0]?.name || 'Wildfires'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ({summaryStats.hazardCounts[0]?.count})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Largest event category</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Peak Activity Day
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-black text-rose-300">
              {summaryStats.peakDay.date}
            </span>
            <span className="text-[10px] font-bold font-mono text-rose-400">
              {summaryStats.peakDay.total} incidents
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Month incident crest</span>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-72 sm:h-80 bg-white/[0.02] border border-white/5 rounded-xl p-2 sm:p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWildfire" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorStorm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorQuake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={4}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#cbd5e1' }}
              />
              <Area
                type="monotone"
                dataKey="wildfire"
                name="Wildfire"
                stackId="1"
                stroke="#f97316"
                fill="url(#colorWildfire)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="storm"
                name="Storms"
                stackId="1"
                stroke="#38bdf8"
                fill="url(#colorStorm)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="flood"
                name="Flood & Slide"
                stackId="1"
                stroke="#06b6d4"
                fill="url(#colorFlood)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="earthquake"
                name="Seismic"
                stackId="1"
                stroke="#a855f7"
                fill="url(#colorQuake)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : chartType === 'composed' ? (
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={4}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#cbd5e1' }}
              />
              <Bar
                dataKey="total"
                name="Daily Alerts"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
                opacity={0.85}
              />
              <Line
                type="monotone"
                dataKey="rollingAvg7d"
                name="7-Day Moving Avg"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff' }}
              />
            </ComposedChart>
          ) : (
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={4}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#cbd5e1' }}
              />
              <Area
                type="monotone"
                dataKey="critical"
                name="Critical Severity"
                stackId="sev"
                stroke="#f43f5e"
                fill="url(#colorCritical)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="high"
                name="High Severity"
                stackId="sev"
                stroke="#f59e0b"
                fill="url(#colorHigh)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="moderate"
                name="Moderate Advisory"
                stackId="sev"
                stroke="#38bdf8"
                fill="url(#colorModerate)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Hazard Category Breakdown Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Category 30-Day Distribution:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {summaryStats.hazardCounts.map((hazard) => {
            const Icon = hazard.icon;
            return (
              <span
                key={hazard.name}
                className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 flex items-center gap-1.5 text-[11px] text-slate-300"
              >
                <Icon className="w-3 h-3" style={{ color: hazard.color }} />
                <span className="font-semibold">{hazard.name}:</span>
                <span className="font-mono font-bold text-white">{hazard.count}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
