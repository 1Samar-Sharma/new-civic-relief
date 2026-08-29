import React, { useState } from 'react';
import {
  Users,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  MapPin,
  Clock,
  PlusCircle,
  Filter,
  MessageSquare,
  AlertTriangle,
  Flame,
  Waves,
  Shield,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { CommunityReport, DisasterCategory, SeverityLevel, Coordinates } from '../../types';

interface CommunityFeedProps {
  reports: CommunityReport[];
  userLocation: Coordinates;
  onVote: (reportId: string, type: 'up' | 'down') => void;
  onSubmitReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>) => void;
  onAnalyzeWithAI: (title: string, desc: string) => Promise<any>;
  onBackToMap?: () => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  reports,
  userLocation,
  onVote,
  onSubmitReport,
  onAnalyzeWithAI,
  onBackToMap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DisasterCategory | 'all'>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New report form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<DisasterCategory>('wildfire');
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [locName, setLocName] = useState('Central District');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);

  const handleRunAI = async () => {
    if (!title && !desc) return;
    setIsAnalyzing(true);
    try {
      const res = await onAnalyzeWithAI(title, desc);
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;

    onSubmitReport({
      authorName: 'Neighbor (You)',
      category,
      title,
      description: desc,
      locationName: locName,
      coordinates: {
        lat: userLocation.lat + (Math.random() * 0.008 - 0.004),
        lng: userLocation.lng + (Math.random() * 0.008 - 0.004),
      },
      severity,
      verifiedByGuardians: false,
      aiHazardAnalysis: aiAnalysis
        ? {
            riskScore: aiAnalysis.riskScore || 7,
            primaryHazards: aiAnalysis.primaryHazards || ['Immediate road block'],
            recommendedActions: aiAnalysis.recommendedActions || ['Avoid area'],
          }
        : undefined,
    });

    setTitle('');
    setDesc('');
    setAiAnalysis(null);
    setShowNewModal(false);
  };

  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToMap && (
              <button
                onClick={onBackToMap}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all mr-1"
                title="Back to Map"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Back to Map</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold uppercase tracking-wider">
              Crowdsourced Dispatch
            </span>
            <span className="text-xs text-slate-400">
              • Verified by local resident votes & civic guardians
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Live Community Situation Stream
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time grassroots updates from neighbors on the ground to stay ahead of fast-moving hazards.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shadow-lg shadow-cyan-400/20 flex-shrink-0 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Post Incident Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Updates' },
          { key: 'wildfire', label: '🔥 Wildfire' },
          { key: 'women_safety', label: '🛡️ Women Safety' },
          { key: 'flood', label: '🌊 Flood' },
          { key: 'landslide', label: '⛰️ Landslide' },
          { key: 'medical_emergency', label: '💊 Medical' },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.key
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.08]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
            <Users className="w-10 h-10 text-cyan-400 mx-auto opacity-70" />
            <h4 className="font-bold text-sm text-white">No Situation Reports in this Sector</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No localized community observations or hazard alerts have been posted yet. Post the first verified report to notify neighbors and emergency dispatchers.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 mt-2"
            >
              <PlusCircle className="w-4 h-4" /> Post First Report
            </button>
          </div>
        ) : (
          filteredReports.map((rep) => {
            const isCritical = rep.severity === 'critical';
            const isHigh = rep.severity === 'high';

            return (
              <div
                key={rep.id}
                className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                  isCritical
                    ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/10'
                    : 'bg-white/[0.04] border-white/10 shadow-2xl hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rep.authorName}</span>
                      {rep.verifiedByGuardians && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Community Verified
                        </span>
                      )}
                      <span className="text-slate-400">• {rep.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">📍 {rep.locationName}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {rep.severity}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <h4 className="font-bold text-sm text-slate-100">{rep.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{rep.description}</p>

                  {/* AI Analysis Tag */}
                  {rep.aiHazardAnalysis && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-md text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> AI Hazard Analysis (Risk {rep.aiHazardAnalysis.riskScore}/10)
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Actions: {rep.aiHazardAnalysis.recommendedActions.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vote & Confirm Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVote(rep.id, 'up')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                        rep.userVoted === 'up'
                          ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Confirm ({rep.upvotes})</span>
                    </button>

                    <button
                      onClick={() => onVote(rep.id, 'down')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                        rep.userVoted === 'down'
                          ? 'bg-red-500 text-white border-red-400 font-bold shadow-md shadow-red-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Dispute ({rep.downvotes})</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    Report ID #{rep.id.slice(-4)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Incident Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#050810]/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Post Community Situation Report</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Incident Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Downed power lines blocking 4th Ave"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none"
                  >
                    <option value="wildfire" className="bg-slate-900 text-slate-200">🔥 Wildfire / Smoke</option>
                    <option value="women_safety" className="bg-slate-900 text-slate-200">🛡️ Women Safety Alert</option>
                    <option value="flood" className="bg-slate-900 text-slate-200">🌊 Flood / Water</option>
                    <option value="landslide" className="bg-slate-900 text-slate-200">⛰️ Landslide</option>
                    <option value="medical_emergency" className="bg-slate-900 text-slate-200">💊 Medical Emergency</option>
                    <option value="other" className="bg-slate-900 text-slate-200">⚠️ Other Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none"
                  >
                    <option value="critical" className="bg-slate-900 text-slate-200">🚨 Critical Life Threat</option>
                    <option value="high" className="bg-slate-900 text-slate-200">⚠️ High Hazard</option>
                    <option value="moderate" className="bg-slate-900 text-slate-200">ℹ️ Moderate</option>
                    <option value="low" className="bg-slate-900 text-slate-200">🟢 Low / Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location / Landmark</label>
                <input
                  type="text"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Street intersection or landmark"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="State what is happening, who is affected, and immediate road or shelter advice..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleRunAI}
                  disabled={isAnalyzing || (!title && !desc)}
                  className="w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  {isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Hazard with AI'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
                  <p className="font-bold text-purple-300">
                    AI Hazard Score: {aiAnalysis.riskScore}/10 ({aiAnalysis.urgencyLevel})
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    Est. Danger Radius: {aiAnalysis.dangerRadiusMeters}m
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black shadow-lg shadow-cyan-400/20 transition-all"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
