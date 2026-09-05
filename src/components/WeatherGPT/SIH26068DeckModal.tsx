import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Users,
  Cpu,
  Coins,
  TrendingUp,
  BookOpen,
  Award,
  Layers,
  MapPin,
  Bot,
  Volume2,
  Shield,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface SIH26068DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchWeatherGPT?: () => void;
}

export const SIH26068DeckModal: React.FC<SIH26068DeckModalProps> = ({
  isOpen,
  onClose,
  onLaunchWeatherGPT,
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6;

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev > 1 ? prev - 1 : totalSlides));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0B2545] border border-sky-500/30 rounded-3xl shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#071930]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center font-black text-white text-xs shadow-md">
              R<sub className="text-[9px]">Q</sub>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  Res<span className="text-sky-400">Q</span>Tech
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold">
                  PS ID: SIH 26068
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Smart India Hackathon 2026 · Official Submission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Slide selector pills */}
            <div className="hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentSlide(num)}
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all ${
                    currentSlide === num
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  0{num}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all ml-2"
              title="Close Deck"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-gradient-to-b from-[#0B2545] to-[#07182E]">
          {/* SLIDE 1: IDEA SUBMISSION */}
          {currentSlide === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  01 · Idea Submission
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-bold text-[10px]">
                  SIH 26068 · Disaster Management
                </span>
                <span className="text-slate-400 text-xs">Category: Software (Web · Mobile-First)</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  WeatherGPT <span className="text-sky-400">—</span>
                  <br />
                  <span className="italic font-serif font-normal text-sky-300">Ask the sky.</span> Get an answer.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-3xl leading-relaxed">
                  A conversational AI for weather forecasting, severe-weather alerts and climate information — bundled inside <strong className="text-sky-300">Civic Relief</strong>, our community disaster-response hub.
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-b border-white/10 py-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Theme</div>
                  <div className="font-bold text-white text-sm">Disaster Management</div>
                  <div className="text-xs text-slate-400">Public Safety & Early Warning</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Primary Product</div>
                  <div className="font-bold text-sky-300 text-sm">Conversational WeatherGPT</div>
                  <div className="text-xs text-slate-400">Voice-first Indic AI (24+ languages)</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Secondary Product</div>
                  <div className="font-bold text-emerald-300 text-sm">Civic Relief Layer</div>
                  <div className="text-xs text-slate-400">Mutual aid, shelters & 5km mesh</div>
                </div>
              </div>

              {/* Team ResQTech Block */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Team ResQTech · JNGEC Sundernagar (Himachal Pradesh)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-black">
                    Samar Sharma (Team Lead)
                  </span>
                  {['Shagun Sharma', 'Nikhil Kumar', 'Yugank', 'Monika', 'Shaurya Rana'].map((member, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-medium">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: PROPOSED SOLUTION */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  02 · Proposed Solution
                </span>
                <span className="text-slate-400 text-xs">SIH 26068 Core Innovation</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Talk to the weather. <span className="italic font-serif font-normal text-sky-400">Then act on it.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  WeatherGPT turns forecasting into a natural conversation — multilingual, voice-enabled, hyperlocal to 5 km. Every severe answer can flow into Civic Relief's response layer: community alerts, verified volunteers and matched aid.
                </p>
              </div>

              {/* Four Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center text-lg">
                    💬
                  </div>
                  <h4 className="font-bold text-white text-sm">Conversational</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Natural-language weather Q&A — no complex charts or jargon. Voice in, voice out in any Indic dialect.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg">
                    📍
                  </div>
                  <h4 className="font-bold text-white text-sm">Hyperlocal (5km)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    5-km radius forecasts using GPS + IMD grids + INSAT satellite telemetry fusion.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg">
                    🌐
                  </div>
                  <h4 className="font-bold text-white text-sm">Multilingual</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hindi, English, Punjabi, Tamil, Telugu, Marathi + 18 more Indic scheduled languages.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-orange-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center text-lg">
                    ⚠
                  </div>
                  <h4 className="font-bold text-white text-sm">Actionable Advice</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Persona-aware advice for farmers (sowing/harvest), fishermen (sea-state), commuters & disaster cells.
                  </p>
                </div>
              </div>

              {/* Flow diagram */}
              <div className="p-4 rounded-2xl bg-[#051329] border border-sky-500/30 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                  ◉ Conversation → Response Loop
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Step 01 · Citizen</span>
                    <strong className="text-white">Ask in Voice / Text</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500 text-slate-950">
                    <span className="text-[10px] opacity-80 block uppercase">Step 02 · Core</span>
                    <strong className="font-black">WeatherGPT AI</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-slate-400 block uppercase">Step 03 · Telemetry</span>
                    <strong className="text-white">IMD · Sat · OpenWeather</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300">
                    <span className="text-[10px] opacity-80 block uppercase">Step 04 · If Severe</span>
                    <strong className="font-black">Civic Relief Hub</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: TECHNICAL APPROACH */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  03 · Technical Approach
                </span>
                <span className="text-slate-400 text-xs">System Architecture (Bottom-Up)</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  A grounded LLM, <span className="italic font-serif font-normal text-sky-400">not a guessing one.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  Gemini reasons over IMD + OpenWeather + satellite data via retrieval-augmented generation (RAG) and function-calling — so every answer is traceable to a live weather source, never hallucinated.
                </p>
              </div>

              {/* 5 Architecture Layers */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-sky-400 font-bold">01 FRONTEND</span>
                    <span className="font-bold text-white text-sm">Mobile-First PWA & Web Client</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['React 18', 'TypeScript', 'Vite', 'PWA Offline Cache', 'Leaflet GIS'].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-emerald-400 font-bold">02 VOICE I/O</span>
                    <span className="font-bold text-white text-sm">Speech-to-Text & Dialect Voice Notes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['Whisper STT', 'Web Speech TTS', 'Bhashini API', '24 Indic Languages'].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/40 to-slate-900 border border-orange-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-orange-400 font-bold">03 LLM CORE</span>
                    <span className="font-bold text-white text-sm">Function-Calling & RAG Grounding</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['Gemini 3.8 Flash', 'Function-Calling', 'Vector Grounding', 'Persona Router', 'Safety Filters'].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-cyan-400 font-bold">04 DATA SOURCES</span>
                    <span className="font-bold text-white text-sm">Verified Real Meteorological Grids</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['IMD Grids', 'OpenWeather', 'INSAT Sat', 'NDMA Advisories', 'Historic Climate'].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-purple-400 font-bold">05 BACKEND</span>
                    <span className="font-bold text-white text-sm">Real-time Store & Geo-fenced Push</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {['Firebase Auth', 'Firestore', 'FCM Push', 'REST APIs'].map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: FEASIBILITY */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  04 · Feasibility & Viability
                </span>
                <span className="text-slate-400 text-xs">Buildable Today · Scalable Tomorrow</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Buildable today. <span className="italic font-serif font-normal text-sky-400">Scalable tomorrow.</span>
                </h2>
              </div>

              {/* 3 Feasibility Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center font-mono font-bold">T</span>
                    <span>Technical Feasibility</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Production-grade LLM API with function-calling.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>IMD & OpenWeather REST endpoints available.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Unified PWA for Android, iOS & Desktop.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center font-mono font-bold">₹</span>
                    <span>Economic Feasibility</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Low-CapEx MVP using cloud tier endpoints.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Per-query cost ≈ ₹0.05 after local caching.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Freemium for citizens, subsidized by disaster grants.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center font-mono font-bold">◉</span>
                    <span>Operational Feasibility</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>One-tap onboarding; voice-first for low literacy.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Persona modes auto-tune advice for farmers & fishers.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Civic Relief handoff connects severe alerts to aid.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Challenge vs Mitigation */}
              <div className="p-4 rounded-2xl bg-[#061426] border border-white/10 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Zero Hallucination Guardrail:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every numeric value (temperature, rainfall mm, wind speed, wave height) is derived directly from live function-calling and verified meteorological sensors. The LLM is strictly prohibited from inventing arbitrary numbers.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 5: IMPACT & BENEFITS */}
          {currentSlide === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  05 · Impact & Benefits
                </span>
                <span className="text-slate-400 text-xs">National & Socio-Economic Value</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Don't just predict the weather. <span className="italic font-serif font-normal text-sky-400">Answer for it.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  Every year India loses ~₹2 lakh crore to hydro-meteorological disasters and thousands of lives to unreached advisories. WeatherGPT + Civic Relief closes the <strong className="text-sky-300">last-mile advisory gap</strong> — because a forecast that isn't understood, isn't a forecast.
                </p>
              </div>

              {/* 3 Big Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071F3D] to-[#040E1C] border border-sky-500/30 text-center space-y-1">
                  <div className="text-4xl font-black text-sky-400">5 km</div>
                  <div className="text-xs font-bold text-white">Hyperlocal Radius</div>
                  <div className="text-[11px] text-slate-400">Neighborhood-specific forecasts</div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071F3D] to-[#040E1C] border border-emerald-500/30 text-center space-y-1">
                  <div className="text-4xl font-black text-emerald-400">24+</div>
                  <div className="text-xs font-bold text-white">Indic Languages</div>
                  <div className="text-[11px] text-slate-400">Voice in and voice out</div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071F3D] to-[#040E1C] border border-amber-500/30 text-center space-y-1">
                  <div className="text-4xl font-black text-amber-400">1 : 115</div>
                  <div className="text-xs font-bold text-white">UNDRR ROI Dividend</div>
                  <div className="text-[11px] text-slate-400">₹1 early warning saves ₹115 in relief</div>
                </div>
              </div>

              {/* Beneficiary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🌾</div>
                  <strong className="text-white block">Farmers</strong>
                  <span className="text-[10px] text-slate-400">Sowing & harvest</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🚤</div>
                  <strong className="text-white block">Fishermen</strong>
                  <span className="text-[10px] text-slate-400">Sea-state safety</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🚗</div>
                  <strong className="text-white block">Commuters</strong>
                  <span className="text-[10px] text-slate-400">Flood route alerts</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🏔</div>
                  <strong className="text-white block">Trekkers</strong>
                  <span className="text-[10px] text-slate-400">Mountain weather</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🏛</div>
                  <strong className="text-white block">SDMAs</strong>
                  <span className="text-[10px] text-slate-400">Response cells</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-xl mb-1">🏘</div>
                  <strong className="text-white block">Rural India</strong>
                  <span className="text-[10px] text-slate-400">Voice-first access</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: RESEARCH & REFERENCES */}
          {currentSlide === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold uppercase tracking-wider text-[10px]">
                  06 · Research & References
                </span>
                <span className="text-slate-400 text-xs">Grounded in Science & Standards</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Grounded in <span className="italic font-serif font-normal text-sky-400">science & standards.</span>
                </h2>
              </div>

              {/* Research List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {[
                  {
                    num: '01',
                    title: 'India Meteorological Department (IMD)',
                    domain: 'mausam.imd.gov.in · Nowcast & district-level forecast API',
                    tag: 'Govt',
                  },
                  {
                    num: '02',
                    title: 'National Disaster Management Authority',
                    domain: 'ndma.gov.in · SOPs, hazard maps & advisory framework',
                    tag: 'Govt',
                  },
                  {
                    num: '03',
                    title: 'OpenWeather / Open-Meteo Telemetry',
                    domain: 'open-meteo.com · Numerical Weather Prediction WRF/GFS',
                    tag: 'Data',
                  },
                  {
                    num: '04',
                    title: 'Google Gemini & Function-Calling',
                    domain: 'ai.google.dev · LLM reasoning + tool-use grounding',
                    tag: 'AI',
                  },
                  {
                    num: '05',
                    title: 'Bhashini · Digital India Language Mission',
                    domain: 'bhashini.gov.in · Indic STT, TTS & translation models',
                    tag: 'Govt',
                  },
                  {
                    num: '06',
                    title: 'UNDRR — Early Warning Systems Report',
                    domain: 'undrr.org · ROI of forecast-based action (1:115)',
                    tag: 'Research',
                  },
                  {
                    num: '07',
                    title: 'Lewis et al. — RAG for Knowledge NLP',
                    domain: 'arXiv:2005.11401 · Grounding LLMs on retrieved data',
                    tag: 'Research',
                  },
                ].map((ref) => (
                  <div key={ref.num} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <span className="font-mono text-sky-400 font-bold">{ref.num}</span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs">{ref.title}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-bold uppercase text-slate-300">
                          {ref.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{ref.domain}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thank you note */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-blue-950/60 border border-sky-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-sky-300">Team ResQTech · JNGEC Sundernagar</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Samar Sharma, Shagun Sharma, Nikhil Kumar, Yugank, Monika, Shaurya Rana
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onLaunchWeatherGPT) onLaunchWeatherGPT();
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Launch Live WeatherGPT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#071930]/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-400">
              Slide <strong className="text-white">0{currentSlide}</strong> / 0{totalSlides}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              {currentSlide === 1 && 'Idea Submission & Team'}
              {currentSlide === 2 && 'Proposed Solution & 4 Pillars'}
              {currentSlide === 3 && 'Technical Approach & 5 Layers'}
              {currentSlide === 4 && 'Feasibility & Economic Viability'}
              {currentSlide === 5 && 'Impact, Benefits & Metrics'}
              {currentSlide === 6 && 'Research & Academic References'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Prev</span>
            </button>
            <button
              onClick={nextSlide}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black transition-all flex items-center gap-1 shadow-md"
            >
              <span className="text-xs">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
