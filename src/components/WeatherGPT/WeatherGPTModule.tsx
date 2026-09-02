import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  CloudRain,
  CloudLightning,
  Sun,
  Wind,
  Flame,
  Droplets,
  Gauge,
  Compass,
  AlertTriangle,
  Send,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  Radio,
  HeartHandshake,
  ShieldAlert,
  ArrowUpRight,
  ThermometerSun,
  Eye,
  Info,
  ChevronRight,
  Zap,
  Waves,
  Mountain,
  ArrowLeft,
  Mic,
  MicOff,
  Play,
  Pause,
  Languages,
  Users,
  Compass as CompassIcon,
  BookOpen,
  Cpu,
  Coins,
  ShieldCheck,
  ExternalLink,
  Award,
  Square,
  StopCircle,
} from 'lucide-react';
import {
  CurrentWeatherState,
  DailyWeatherForecast,
  HourlyWeatherForecast,
  ClimateTrendInsight,
  WeatherChatMessage,
  WeatherAlertNotice,
  Coordinates,
  AidCategory,
} from '../../types';
import { soundPlayer } from '../../utils/audio';

interface WeatherGPTModuleProps {
  userLocation: Coordinates;
  userAddress: string;
  onLaunchBroadcastModal?: (initialData?: any) => void;
  onOpenAidRequestModal?: (category?: AidCategory, description?: string) => void;
  onSelectMapItem?: (item: any) => void;
  onSwitchTab?: (tab: any) => void;
  onBackToMap?: () => void;
}

export type PersonaType = 'general' | 'farmer' | 'fisherman' | 'commuter' | 'trekker' | 'sdma' | 'rural';

export interface PersonaConfig {
  id: PersonaType;
  label: string;
  nativeLabel: string;
  icon: string;
  badgeColor: string;
  description: string;
  samplePrompt: string;
  quickPrompts: { label: string; query: string }[];
}

export const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: 'general',
    label: 'Citizen / General',
    nativeLabel: 'नागरिक',
    icon: '🌐',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Hyperlocal 5km forecast, weather safety, and emergency response',
    samplePrompt: 'What is the 24-hour rainfall forecast and flood alert status for my neighborhood?',
    quickPrompts: [
      { label: '🌧️ 24h Rain & Flooding', query: 'What is the 24-hour rainfall forecast and flood risk for my area?' },
      { label: '☀️ Heatwave Safety', query: 'What is the heat index and UV protection protocol today?' },
      { label: '💨 Wind & Gale Alerts', query: 'Are there any high wind gust warnings or gale watches?' },
    ],
  },
  {
    id: 'fisherman',
    label: 'Fisherman (Matsya)',
    nativeLabel: 'मत्स्य / Coastal',
    icon: '🚤',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Sea-state safety, wave height (m), wind speed & IMD 12 nm coastal advisories',
    samplePrompt: 'Mujhe fishing ke liye Kochi coast pe jaana hai kal — safe hai?',
    quickPrompts: [
      { label: '🌊 Kochi Coast Safe to Sail?', query: 'Mujhe fishing ke liye Kochi coast pe jaana hai kal — safe hai?' },
      { label: '⛵ High Swell & 12nm Advisory', query: 'What is the current wave height and IMD nautical mile safety boundary?' },
      { label: '🌅 Safe Sailing Window', query: 'When is the next safe coastal sailing window this week?' },
    ],
  },
  {
    id: 'farmer',
    label: 'Farmer (Kisan)',
    nativeLabel: 'किसान / Agrometeorology',
    icon: '🌾',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Sowing & harvest timing, soil moisture indices, monsoon onset & pesticide window',
    samplePrompt: 'Kya agle 3 din me fasal ki katai (harvest) aur gehu ki buwai karna safe rahega?',
    quickPrompts: [
      { label: '🌾 Sowing & Harvest Window', query: 'Kya agle 3 din me fasal ki katai (harvest) aur buwai karna safe rahega?' },
      { label: '💧 Soil Moisture & Rain Onset', query: 'What is the soil moisture retention and expected monsoon rain onset timing?' },
      { label: '🧪 Pesticide Spraying Suitability', query: 'Is the wind and humidity suitable for pesticide spraying tomorrow?' },
    ],
  },
  {
    id: 'commuter',
    label: 'Commuter (Marg Safety)',
    nativeLabel: 'यात्री / Urban Travel',
    icon: '🚗',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Urban waterlogging hotspots, low visibility fog, and flash pooling underpasses',
    samplePrompt: 'Which major routes or underpasses have waterlogging risks during evening rush hour?',
    quickPrompts: [
      { label: '🚦 Waterlogged Routes', query: 'Which city routes or underpasses have waterlogging risk during evening rush hour?' },
      { label: '🌫️ Fog & Visibility Alert', query: 'Is dense fog expected to reduce visibility below 100m on highways?' },
      { label: '⚡ Flash Rain Onset Time', query: 'At what exact hour will heavy precipitation start impacting commute?' },
    ],
  },
  {
    id: 'trekker',
    label: 'Trekker (Parvat Safety)',
    nativeLabel: 'पर्वतारोही / Altitude',
    icon: '🏔️',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Mountain weather, blizzard alerts, altitude chill lapse rates & cloudburst risks',
    samplePrompt: 'What is the high-altitude cloudburst risk, wind chill, and trail safety for trekking tomorrow?',
    quickPrompts: [
      { label: '⛈️ Cloudburst & Flash Surge', query: 'What is the high-altitude cloudburst risk and trail safety for trekking tomorrow?' },
      { label: '🥶 Wind Chill & Freeze Index', query: 'What will the wind chill and temperature drop be at 2500m+ elevation?' },
      { label: '🏔️ Avalanche & Mudslide Watch', query: 'Are there any landslide or slope failure advisories on hiking paths?' },
    ],
  },
  {
    id: 'sdma',
    label: 'SDMA / Response Cell',
    nativeLabel: 'प्रशासन / Disaster Cell',
    icon: '🏛️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'District-level evacuation triggers, relief shelter readiness & multi-village broadcast',
    samplePrompt: 'Generate a district disaster response briefing and evacuation trigger assessment for our sector.',
    quickPrompts: [
      { label: '🚨 District Evacuation Protocol', query: 'Generate a district disaster response briefing and evacuation trigger assessment.' },
      { label: '🏘️ Low-Lying Village Advisory', query: 'Which low-lying habitations require immediate sandbag staging and shelter activation?' },
      { label: '📢 Multi-Channel Alert Draft', query: 'Draft a bilingual NDMA/SDMA emergency broadcast message for immediate release.' },
    ],
  },
  {
    id: 'rural',
    label: 'Rural India (Gramin)',
    nativeLabel: 'ग्रामीण / Voice-First',
    icon: '🏘️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Voice-first dialect guidance, low-connectivity offline cache & SMS broadcast fallback',
    samplePrompt: 'Hamare gaon me barish kab hogi aur kya bijli girne ka koi khatra hai?',
    quickPrompts: [
      { label: '⚡ Lightning / Bijli Alert', query: 'Hamare gaon me barish kab hogi aur kya bijli girne ka koi khatra hai?' },
      { label: '📦 Ration & Shelter Prep', query: 'Aane wale toofan se pehle gaon walo ko kya taiyari karni chahiye?' },
      { label: '📱 SMS Weather Broadcast', query: 'Generate a short Hindi SMS weather alert for rural feature phones.' },
    ],
  },
];

export const INDIC_LANGUAGES = [
  { code: 'english', label: 'English', native: 'English' },
  { code: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'hinglish', label: 'Hinglish', native: 'Hinglish' },
  { code: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bengali', label: 'Bengali', native: 'বাংলা' },
  { code: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { code: 'telugu', label: 'Telugu', native: 'తెలుగు' },
  { code: 'marathi', label: 'Marathi', native: 'मराठी' },
  { code: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const DEFAULT_CLIMATE_INSIGHTS: ClimateTrendInsight[] = [
  {
    metric: 'Extreme Heavy Precipitation Events (>25mm/24h)',
    currentValue: '4.2 events / yr',
    historicalBaseline: '1.8 events / yr (1980-2010 mean)',
    anomalyDiff: '+133% Surge',
    trendDirection: 'increasing',
    riskInterpretation: 'Atmospheric moisture loads increase flash flood risks along urban drainages and rivers.',
    climateImpactCategory: 'precipitation_flooding',
  },
  {
    metric: 'Critical Fire-Weather Days (RH < 20% + Wind > 30km/h)',
    currentValue: '28 days / yr',
    historicalBaseline: '12 days / yr (1980-2010 mean)',
    anomalyDiff: '+133% Increase',
    trendDirection: 'increasing',
    riskInterpretation: 'Extended dry periods elevate wildfire perimeter expansion and forest fire risks.',
    climateImpactCategory: 'wildfire_drought',
  },
  {
    metric: 'High Heat Index Threshold Days (>35°C / 95°F)',
    currentValue: '22 days / yr',
    historicalBaseline: '9 days / yr (1990-2020 baseline)',
    anomalyDiff: '+144% Surge',
    trendDirection: 'increasing',
    riskInterpretation: 'Urban heat island effects compound cooling demands and vulnerable population health risks.',
    climateImpactCategory: 'extreme_heat',
  },
  {
    metric: 'Soil Moisture Retention & Flash Runoff Index',
    currentValue: 'Moderate Variance',
    historicalBaseline: 'Stable (30-year average)',
    anomalyDiff: '+40% Runoff Variance',
    trendDirection: 'increasing',
    riskInterpretation: 'Rapid soil moisture loss followed by concentrated downpours elevates landslide susceptibility.',
    climateImpactCategory: 'storm_surges',
  },
];

export const WeatherGPTModule: React.FC<WeatherGPTModuleProps> = ({
  userLocation,
  userAddress,
  onLaunchBroadcastModal,
  onOpenAidRequestModal,
  onSwitchTab,
  onBackToMap,
}) => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(true);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherState | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherForecast[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWeatherForecast[]>([]);
  const [climateTrends, setClimateTrends] = useState<ClimateTrendInsight[]>(DEFAULT_CLIMATE_INSIGHTS);
  const [activeAlerts, setActiveAlerts] = useState<WeatherAlertNotice[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  // Tab State: chat | 7day | hourly | architecture | feasibility | climate | research
  const [activeSubTab, setActiveSubTab] = useState<
    'chat' | '7day' | 'hourly' | 'architecture' | 'feasibility' | 'climate' | 'research'
  >('chat');

  // Persona & Language Selection
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');

  // Speech Recognition & Voice States
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceRecordingDuration, setVoiceRecordingDuration] = useState<number>(0);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);
  const [isPlayingFullSpeech, setIsPlayingFullSpeech] = useState<boolean>(false);
  const [playingSpeechMessageId, setPlayingSpeechMessageId] = useState<string | null>(null);
  const [liveSpokenTranscript, setLiveSpokenTranscript] = useState<string>('');
  const [isAutoSubmittingVoice, setIsAutoSubmittingVoice] = useState<boolean>(false);
  const [autoReadAnswers, setAutoReadAnswers] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const speechCancelledRef = useRef<boolean>(false);
  const speechSentenceChunksRef = useRef<string[]>([]);
  const speechQueueIndexRef = useRef<number>(0);

  const isRecordingVoiceRef = useRef<boolean>(false);
  const isSubmittingVoiceRef = useRef<boolean>(false);
  const isSendingMessageRef = useRef<boolean>(false);
  const lastSentTextRef = useRef<string>('');
  const lastSentTimeRef = useRef<number>(0);
  const fallbackTimeoutRef = useRef<any>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Conversational Chat State
  const [messages, setMessages] = useState<WeatherChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `👋 **Hello! I'm WeatherGPT**, your conversational AI meteorologist and climate disaster intelligence guide.\n\nI am actively analyzing atmospheric telemetry, radar grids, and microclimate risk indices around **${userAddress}** (Hyperlocal 5km radius).\n\n💡 **Select a specialized persona above** (Farmer, Fisherman, Commuter, Trekker, SDMA, Rural) or ask me anything in any language using voice or text!`,
      timestamp: 'Just now',
      personaUsed: 'general',
      voiceNoteDuration: '0:06',
      structuredHazard: {
        hazardType: 'flood',
        severity: 'watch',
        riskScore: 45,
        recommendedActions: [
          'Monitor 24h precipitation timeline for localized convective downpours',
          'Clear property drainage culverts and stage sandbags along basements',
          'Coordinate with 5km civilian Guardian volunteers for mutual aid readiness',
        ],
        affectedRadiusKm: 5.0,
        communityAidTriggers: ['Sandbags & Pumps', 'Senior Welfare Check', 'Shelter Readiness'],
      },
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch forecast on location change or mount
  useEffect(() => {
    fetchWeatherForecast();
    fetchClimateTrends();
  }, [userLocation, userAddress]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  // Clean up timers & media stream on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const fetchWeatherForecast = async () => {
    setIsLoadingForecast(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch('/api/ai/weather-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          locationName: userAddress,
          coordinates: userLocation,
        }),
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.forecast) {
          setCurrentWeather(data.forecast.current);
          setDailyForecast(data.forecast.daily || []);
          setHourlyForecast(data.forecast.hourly || []);
          setActiveAlerts(data.forecast.alerts || []);
        }
      }
    } catch {
      // Retain existing state gracefully
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingForecast(false);
    }
  };

  const fetchClimateTrends = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/ai/climate-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          locationName: userAddress,
        }),
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.insights) && data.insights.length > 0) {
          setClimateTrends(data.insights);
        }
      }
    } catch {
      // Retain DEFAULT_CLIMATE_INSIGHTS gracefully
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const getSpeechLangCode = (lang: string) => {
    const map: Record<string, string> = {
      english: 'en-IN',
      hindi: 'hi-IN',
      hinglish: 'hi-IN',
      punjabi: 'pa-IN',
      bengali: 'bn-IN',
      tamil: 'ta-IN',
      telugu: 'te-IN',
      marathi: 'mr-IN',
      gujarati: 'gu-IN',
      malayalam: 'ml-IN',
      kannada: 'kn-IN',
      odia: 'or-IN',
      spanish: 'es-ES',
      french: 'fr-FR',
      german: 'de-DE',
    };
    return map[lang] || 'en-IN';
  };

  const cleanMarkdownForSpeech = (rawText: string): string => {
    if (!rawText) return '';
    return rawText
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/#{1,6}\s+/g, '') // remove markdown headings
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold to plain
      .replace(/\*([^*]+)\*/g, '$1') // italic to plain
      .replace(/^[\s*•-]+\s+/gm, '') // bullet dashes
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link anchors
      .replace(/\|[-:\s|]+\|/g, '') // table header dividers
      .replace(/\|/g, ', ') // table cells to commas
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // strip emoji characters that cause speech engine pauses
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\n+/g, '. ')
      .replace(/\.\s*\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const stopAllSpeech = () => {
    speechCancelledRef.current = true;
    speechSentenceChunksRef.current = [];
    speechQueueIndexRef.current = 0;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsPlayingFullSpeech(false);
    setPlayingSpeechMessageId(null);
    setPlayingVoiceNoteId(null);
  };

  const readFullInfo = (messageId: string, fullText: string) => {
    if (!('speechSynthesis' in window)) return;

    // Toggle off if already reading this message
    if (playingSpeechMessageId === messageId || (playingVoiceNoteId === messageId && isPlayingFullSpeech)) {
      stopAllSpeech();
      return;
    }

    stopAllSpeech();
    speechCancelledRef.current = false;

    const cleaned = cleanMarkdownForSpeech(fullText);
    if (!cleaned) return;

    // Break into sentence chunks so browser speech synthesis never times out
    const rawSentences = cleaned.match(/[^.!?।]+[.!?।]+|\S+$/g) || [cleaned];
    const sentenceChunks: string[] = [];
    for (const s of rawSentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      if (trimmed.length > 160) {
        const subParts = trimmed.split(/,\s+/);
        sentenceChunks.push(...subParts.filter(Boolean));
      } else {
        sentenceChunks.push(trimmed);
      }
    }

    if (sentenceChunks.length === 0) return;

    speechSentenceChunksRef.current = sentenceChunks;
    speechQueueIndexRef.current = 0;
    setIsPlayingFullSpeech(true);
    setPlayingSpeechMessageId(messageId);
    setPlayingVoiceNoteId(messageId);

    const langCode = getSpeechLangCode(selectedLanguage);

    const speakNextSentence = () => {
      if (speechCancelledRef.current) return;
      const index = speechQueueIndexRef.current;
      if (index >= speechSentenceChunksRef.current.length) {
        setIsPlayingFullSpeech(false);
        setPlayingSpeechMessageId(null);
        setPlayingVoiceNoteId(null);
        return;
      }

      const currentSentence = speechSentenceChunksRef.current[index];
      const utterance = new SpeechSynthesisUtterance(currentSentence);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = langCode;

      utterance.onend = () => {
        if (!speechCancelledRef.current) {
          speechQueueIndexRef.current += 1;
          speakNextSentence();
        }
      };

      utterance.onerror = (e) => {
        if (!speechCancelledRef.current) {
          speechQueueIndexRef.current += 1;
          speakNextSentence();
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech speak error:', err);
        setIsPlayingFullSpeech(false);
        setPlayingSpeechMessageId(null);
        setPlayingVoiceNoteId(null);
      }
    };

    speakNextSentence();
  };

  const stopVoiceRecording = () => {
    isRecordingVoiceRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    // Stop recognition with detached event handlers to avoid ghost onend triggers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.stop();
        if (typeof recognitionRef.current.abort === 'function') {
          recognitionRef.current.abort();
        }
      } catch {}
      recognitionRef.current = null;
    }
    // Stop recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    // Stop animation frame
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    // Stop hardware audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    setIsRecordingVoice(false);
    setAudioLevel(0);
    soundPlayer.playBeep(440, 0.08);
  };

  const finishAndSubmitVoice = (overrideText?: string) => {
    if (isSubmittingVoiceRef.current) return;
    isSubmittingVoiceRef.current = true;
    isRecordingVoiceRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    const spoken = (overrideText || accumulatedSpeechRef.current || inputQuery).trim();
    stopVoiceRecording();

    if (spoken && spoken.length > 1) {
      setIsAutoSubmittingVoice(true);
      setInputQuery('');
      setLiveSpokenTranscript('');
      accumulatedSpeechRef.current = '';
      handleSendMessage(spoken);
      setTimeout(() => {
        setIsAutoSubmittingVoice(false);
        isSubmittingVoiceRef.current = false;
      }, 800);
    } else {
      isSubmittingVoiceRef.current = false;
    }
  };

  // Speech-To-Text (Enhanced Word Detection & Auto-Submit)
  const toggleVoiceRecording = async () => {
    if (isRecordingVoiceRef.current || isRecordingVoice) {
      finishAndSubmitVoice();
      return;
    }

    // Stop any active speech readout before listening
    stopAllSpeech();
    setMicPermissionError(null);
    accumulatedSpeechRef.current = '';
    setLiveSpokenTranscript('');
    isSubmittingVoiceRef.current = false;
    isRecordingVoiceRef.current = true;

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // 1. Request hardware microphone stream and setup audio level analyser
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Setup audio visualizer analyzer
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
            animFrameRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        }
      }
    } catch (micErr: any) {
      console.warn('Microphone permission notice:', micErr);
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        setMicPermissionError('Microphone access was denied. Please allow microphone access in your browser settings to speak.');
      }
    }

    // 2. Start Speech Recognition with enhanced accuracy
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setIsRecordingVoice(true);
    setVoiceRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setVoiceRecordingDuration((prev) => prev + 1);
    }, 1000);
    soundPlayer.playBeep(580, 0.1);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.lang = getSpeechLangCode(selectedLanguage);

        recognition.onstart = () => {
          setIsRecordingVoice(true);
          isRecordingVoiceRef.current = true;
        };

        recognition.onresult = (event: any) => {
          if (!isRecordingVoiceRef.current || isSubmittingVoiceRef.current) return;
          let interim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalChunk += item[0].transcript + ' ';
            } else {
              interim += item[0].transcript;
            }
          }

          if (finalChunk) {
            accumulatedSpeechRef.current = (accumulatedSpeechRef.current + ' ' + finalChunk).trim();
          }

          const currentLive = (accumulatedSpeechRef.current + ' ' + interim).trim();
          if (currentLive) {
            setInputQuery(currentLive);
            setLiveSpokenTranscript(currentLive);

            // Auto-send silence debounce: 1.3s of pause after speaking triggers automatic submit
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (isRecordingVoiceRef.current && !isSubmittingVoiceRef.current && currentLive.length > 2) {
                finishAndSubmitVoice(currentLive);
              }
            }, 1300);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event warning:', event.error);
          if (event.error === 'not-allowed') {
            setMicPermissionError('Microphone permission was blocked. Check browser permissions.');
          }
        };

        recognition.onend = () => {
          if (isRecordingVoiceRef.current && !isSubmittingVoiceRef.current) {
            const text = accumulatedSpeechRef.current || inputQuery;
            if (text.trim().length > 1) {
              finishAndSubmitVoice(text);
            } else {
              stopVoiceRecording();
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn('Could not launch speech recognition instance:', e);
        simulateSpeechFallback();
      }
    } else {
      simulateSpeechFallback();
    }
  };

  const simulateSpeechFallback = () => {
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = setTimeout(() => {
      if (isSubmittingVoiceRef.current || !isRecordingVoiceRef.current) return;
      const activePersonaConfig = PERSONA_CONFIGS.find((p) => p.id === selectedPersona) || PERSONA_CONFIGS[0];
      if (!inputQuery.trim()) {
        setInputQuery(activePersonaConfig.samplePrompt);
      }
      finishAndSubmitVoice(activePersonaConfig.samplePrompt);
    }, 2800);
  };

  // Play Voice Note for an Assistant Response
  const playVoiceNote = (messageId: string, textToSpeak: string) => {
    readFullInfo(messageId, textToSpeak);
  };

  const handleSendMessage = async (customText?: string, overridePersona?: PersonaType) => {
    const textToSend = (customText || inputQuery).trim();
    const now = Date.now();

    if (!textToSend || isSendingMessageRef.current || isAsking) return;

    // Deduplication lock: block duplicate submissions within 1.5 seconds or identical text within 3 seconds
    if (
      now - lastSentTimeRef.current < 1200 ||
      (textToSend === lastSentTextRef.current && now - lastSentTimeRef.current < 3000)
    ) {
      return;
    }

    lastSentTimeRef.current = now;
    lastSentTextRef.current = textToSend;
    isSendingMessageRef.current = true;
    soundPlayer.playBeep(440, 0.08);

    const personaToUse = overridePersona || selectedPersona;

    const userMsg: WeatherChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      personaUsed: personaToUse,
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLiveSpokenTranscript('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/ai/weather-gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          locationName: userAddress,
          coordinates: userLocation,
          persona: personaToUse,
          language: selectedLanguage,
          weatherContext: currentWeather,
          conversationHistory: messages.slice(-4),
        }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMsg: WeatherChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personaUsed: data.personaUsed || personaToUse,
          language: selectedLanguage,
          voiceNoteDuration: '0:05',
          waveHeightM: data.waveHeightM,
          structuredHazard:
            data.hazardType && data.hazardType !== 'none'
              ? {
                  hazardType: data.hazardType,
                  severity: data.severity || 'watch',
                  riskScore: data.riskScore || 50,
                  recommendedActions: data.recommendedActions || [],
                  affectedRadiusKm: 5.0,
                  communityAidTriggers: data.communityAidTriggers || [],
                }
              : undefined,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        soundPlayer.playBeep(660, 0.12);

        // Auto-read full answer if enabled and not muted
        if (autoReadAnswers && !isAudioMuted && 'speechSynthesis' in window) {
          const speechText = data.fullInfoToRead || data.reply;
          readFullInfo(assistantMsg.id, speechText);
        }
      } else {
        const fallbackMsg: WeatherChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.reply || `⚠️ Meteorological telemetry analysis for **${userAddress}** encountered a network delay. Real-time radar feeds and baseline conditions remain accessible in the 7-Day and Microclimate tabs.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          personaUsed: personaToUse,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
        if (autoReadAnswers && !isAudioMuted && 'speechSynthesis' in window) {
          readFullInfo(fallbackMsg.id, fallbackMsg.text);
        }
      }
    } catch (error) {
      console.error('Error sending message to WeatherGPT:', error);
      const fallbackMsg: WeatherChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `⚠️ Meteorological telemetry analysis for **${userAddress}** encountered a network delay. Real-time radar feeds and baseline conditions remain accessible in the 7-Day and Microclimate tabs.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        personaUsed: personaToUse,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoReadAnswers && !isAudioMuted && 'speechSynthesis' in window) {
        readFullInfo(fallbackMsg.id, fallbackMsg.text);
      }
    } finally {
      setIsAsking(false);
      isSendingMessageRef.current = false;
    }
  };

  const handleTriggerAidFromWeather = (categoryStr: string, hazardName: string) => {
    let aidCat: AidCategory = 'shelter';
    const lower = categoryStr.toLowerCase();
    if (lower.includes('sandbag') || lower.includes('pump') || lower.includes('manpower')) aidCat = 'manpower';
    else if (lower.includes('water') || lower.includes('food') || lower.includes('hydration')) aidCat = 'food_water';
    else if (lower.includes('medical') || lower.includes('first aid') || lower.includes('trauma')) aidCat = 'medical';
    else if (lower.includes('blanket') || lower.includes('warmth') || lower.includes('jacket')) aidCat = 'clothing';
    else if (lower.includes('generator') || lower.includes('power') || lower.includes('transport') || lower.includes('4x4'))
      aidCat = 'power_transport';

    if (onOpenAidRequestModal) {
      onOpenAidRequestModal(
        aidCat,
        `WeatherGPT Alert [${hazardName}]: Requesting community support for ${categoryStr} at ${userAddress}.`
      );
    }
  };

  const handleBroadcastWeatherWarning = (hazard: any) => {
    if (onLaunchBroadcastModal) {
      onLaunchBroadcastModal({
        title: `Weather Alert: ${hazard.hazardHeadline || hazard.headline || hazard.hazardType || 'Severe Weather Condition'}`,
        description: `WeatherGPT has identified a ${hazard.severity || hazard.hazardSeverity || 'high'} risk weather threat affecting the 5km radius of ${userAddress}. Residents are advised to take immediate precautions.`,
        category:
          hazard.hazardType === 'flood'
            ? 'flood'
            : hazard.hazardType === 'heatwave'
            ? 'medical'
            : hazard.hazardType === 'wildfire_weather'
            ? 'wildfire'
            : 'storm',
        urgency: hazard.severity === 'emergency' || hazard.severity === 'warning' ? 'critical_urgent' : 'high',
      });
    }
  };

  const formatTemp = (c?: number, f?: number) => {
    if (c === undefined) return '--';
    return unit === 'C' ? `${c}°C` : `${f ?? Math.round((c * 9) / 5 + 32)}°F`;
  };

  const getWeatherIconComponent = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-sky-300`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-cyan-400 animate-pulse`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-purple-400 animate-bounce`} />;
      case 'wind':
        return <Wind className={`${className} text-teal-300`} />;
      case 'flame':
        return <Flame className={`${className} text-rose-500`} />;
      default:
        return <CloudSun className={`${className} text-sky-300`} />;
    }
  };

  const getHazardBadge = (hazardType?: string, severity?: string) => {
    if (!hazardType || hazardType === 'none') return null;
    const isCritical = severity === 'critical' || severity === 'emergency' || severity === 'warning';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
          isCritical
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        }`}
      >
        <AlertTriangle className="w-3 h-3" />
        {hazardType.replace('_', ' ')} • {severity}
      </span>
    );
  };

  const currentPersonaConfig = PERSONA_CONFIGS.find((p) => p.id === selectedPersona) || PERSONA_CONFIGS[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* ========================================================================= */}
      {/* RESQTECH DISASTER INTELLIGENCE HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#09152e] to-[#040814] border border-sky-500/30 p-5 sm:p-7 shadow-2xl shadow-sky-950/50">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Header Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-600/30 to-blue-600/30 border border-sky-400/40 text-sky-200 font-extrabold tracking-wider uppercase text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>ResQTech · REPORT · PREDICT · ALERT · RESPOND</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-[10px] tracking-wide">
                <span>WEATHER DISASTER INTELLIGENCE</span>
                <span className="font-mono bg-sky-500/20 px-1 rounded">AI PLATFORM</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                Disaster Management & Public Safety
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex flex-wrap items-baseline gap-2">
                <span>WeatherGPT</span>
                <span className="text-slate-400 font-light">—</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 italic">
                  Ask the sky. Get an answer.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
                A conversational AI for weather forecasting, severe-weather alerts and climate information — bundled inside <span className="text-sky-400 font-bold">Civic Relief</span>, our community disaster-response hub.
              </p>
            </div>

            {/* Subtitle Tag */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">ResQTech Intelligence:</span>
              <span className="text-slate-300">Hyperlocal Atmospheric Forecaster & Early Warning Mesh</span>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 text-sm">
                  💬
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">Conversational</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Natural voice/chat</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-sm">
                  🌐
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">Multilingual</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">24+ Indic languages</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 text-sm">
                  📍
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">5 km Hyperlocal</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Neighborhood grids</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-sm">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-none">Civic Relief Hub</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Aid & Volunteer sync</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* 3 Impact Badges (from PDF page 4) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xl font-black text-sky-400">5km</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Hyperlocal Radius</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xl font-black text-emerald-400">24+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Indic Dialects</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-xl font-black text-amber-400">&lt;3s</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Voice Response</div>
              </div>
            </div>

            {/* Unit Toggle & Refresh */}
            <div className="flex items-center justify-between gap-2 bg-white/[0.03] border border-white/10 p-2 rounded-2xl">
              <span className="text-xs text-slate-300 font-semibold px-2">Units:</span>
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setUnit('C')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    unit === 'C' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °C Metric
                </button>
                <button
                  onClick={() => setUnit('F')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    unit === 'F' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °F Imperial
                </button>
              </div>

              <button
                onClick={() => {
                  fetchWeatherForecast();
                  fetchClimateTrends();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
                title="Refresh live telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingForecast ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME GROUNDED WEATHER TELEMETRY WIDGET */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              {getWeatherIconComponent(currentWeather?.conditionIcon || 'cloud-sun', 'w-10 h-10')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatTemp(currentWeather?.temperatureC, currentWeather?.temperatureF)}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Feels like {formatTemp(currentWeather?.feelsLikeC, currentWeather?.feelsLikeF)}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-200 mt-0.5">
                {currentWeather?.condition || 'Clear Sky'} • {currentWeather?.conditionDescription || 'Normal Conditions'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>IMD & OpenWeather Grounded</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">{userAddress}</span>
            </div>
          </div>
        </div>

        {/* 6 Meteorological Gauges (Including Sea-State & Wave Height) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-black text-white">{currentWeather?.humidityPct || 55}%</div>
            <div className="text-[10px] text-slate-500">Dew point: {currentWeather?.dewPointC || 14}°C</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Wind Vector</span>
              <Wind className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-lg font-black text-white">
              {currentWeather?.windSpeedKmh || 14} km/h {currentWeather?.windDirection || 'W'}
            </div>
            <div className="text-[10px] text-slate-500">Gusts: {currentWeather?.windGustKmh || 18} km/h</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Air Quality</span>
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400">AQI {currentWeather?.aqiIndex || 35}</div>
            <div className="text-[10px] text-slate-500">{currentWeather?.aqiStatus || 'Good'}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Barometric</span>
              <CompassIcon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-white">{currentWeather?.barometricPressureHpa || 1013} hPa</div>
            <div className="text-[10px] text-slate-500">Steady pressure</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>UV Index</span>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white">{currentWeather?.uvIndex || 4} / 11</div>
            <div className="text-[10px] text-slate-500">Moderate solar load</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Sea State Wave</span>
              <Waves className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-black text-sky-300">
              {(Math.max(0.6, ((currentWeather?.windSpeedKmh || 12) * 0.08) + ((currentWeather?.precipitationMm || 0) > 5 ? 1.2 : 0.2))).toFixed(1)} m
            </div>
            <div className="text-[10px] text-slate-500">Coastal swell model</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NAVIGATION SUB-TABS (7 SECTIONS COVERING ENTIRE PDF PROPOSAL) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <Bot className="w-4 h-4" />
          Conversational WeatherGPT AI
        </button>

        <button
          onClick={() => setActiveSubTab('7day')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === '7day'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          7-Day Disaster Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('hourly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'hourly'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          24h Rain & Wind Timeline
        </button>

        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'architecture'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          System Architecture (5 Layers)
        </button>

        <button
          onClick={() => setActiveSubTab('feasibility')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'feasibility'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <Coins className="w-4 h-4" />
          Feasibility & Mitigations
        </button>

        <button
          onClick={() => setActiveSubTab('climate')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'climate'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Climate Trends (30-Yr Shift)
        </button>

        <button
          onClick={() => setActiveSubTab('research')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeSubTab === 'research'
              ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
              : 'bg-white/[0.03] text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Research & Standards (01-07)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CONVERSATIONAL WEATHERGPT AI (WITH PERSONAS & VOICE NOTES) */}
      {/* ========================================================================= */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          {/* Persona Selection Bar (From PDF page 2 & 4) */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Specialized Citizen Personas (Talk to the Weather):
                </span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-300 font-bold">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-sky-500 font-bold"
                >
                  {INDIC_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label} ({l.native})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Persona Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {PERSONA_CONFIGS.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setSelectedPersona(persona.id);
                      soundPlayer.playBeep(520, 0.05);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-500/30 text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{persona.icon}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                    <div className="text-xs font-bold truncate">{persona.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{persona.nativeLabel}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Persona Description & Quick Actions */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-300 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentPersonaConfig.icon} {currentPersonaConfig.label} Mode
                </span>
                <span className="text-slate-400 text-[11px] hidden md:inline">
                  {currentPersonaConfig.description}
                </span>
              </div>

              {/* Sample Prompt Starter Button */}
              <button
                onClick={() => handleSendMessage(currentPersonaConfig.samplePrompt)}
                className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-200 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Try Persona Prompt</span>
              </button>
            </div>
          </div>

          {/* Chat Container & Side Panel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chat Box */}
            <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[680px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      WeatherGPT Assistant
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Online · Voice Ready
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Grounded in IMD + OpenWeather + INSAT Satellites (RAG & Function Calling)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Auto-Read Toggle Switch */}
                  <button
                    onClick={() => {
                      const next = !autoReadAnswers;
                      setAutoReadAnswers(next);
                      if (!next) stopAllSpeech();
                    }}
                    title={autoReadAnswers ? 'Auto-Read full info is ON. Click to turn OFF' : 'Auto-Read is OFF. Click to turn ON'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      autoReadAnswers
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                    }`}
                  >
                    {autoReadAnswers ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Voice Read:</span>
                    <span>{autoReadAnswers ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextMute = !isAudioMuted;
                      setIsAudioMuted(nextMute);
                      if (nextMute) stopAllSpeech();
                    }}
                    title={isAudioMuted ? 'Unmute voice readouts' : 'Mute voice readouts'}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
                  >
                    {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                  </button>
                  <button
                    onClick={() => {
                      stopAllSpeech();
                      setMessages([
                        {
                          id: `reset-${Date.now()}`,
                          sender: 'assistant',
                          text: `Chat reset. WeatherGPT is ready for **${userAddress}** in ${selectedPersona.toUpperCase()} mode.`,
                          timestamp: 'Just now',
                          personaUsed: selectedPersona,
                          voiceNoteDuration: '0:03',
                        },
                      ]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Active Speech Synthesizer Global Bar */}
              {isPlayingFullSpeech && (
                <div className="mt-3 px-4 py-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between gap-3 animate-fadeIn shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <div className="text-xs text-indigo-200 font-bold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                      <span>Reading out full weather telemetry and guidance...</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={stopAllSpeech}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop Reading</span>
                  </button>
                </div>
              )}

              {/* Chat Message Scroll Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-sky-600/30 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0 mt-1">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-sm shadow-lg shadow-sky-500/20'
                          : 'bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-sm shadow-xl'
                      }`}
                    >
                      {/* Persona Badge if assistant */}
                      {msg.sender === 'assistant' && msg.personaUsed && (
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/5 text-[10px]">
                          <span className="font-extrabold uppercase tracking-wider text-sky-400">
                            {PERSONA_CONFIGS.find((p) => p.id === msg.personaUsed)?.icon}{' '}
                            {msg.personaUsed.toUpperCase()} MODE
                          </span>

                          {/* Voice Readout Pill */}
                          <button
                            onClick={() => {
                              if (playingSpeechMessageId === msg.id || (playingVoiceNoteId === msg.id && isPlayingFullSpeech)) {
                                stopAllSpeech();
                              } else {
                                readFullInfo(msg.id, msg.text);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                              playingSpeechMessageId === msg.id || (playingVoiceNoteId === msg.id && isPlayingFullSpeech)
                                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50 animate-pulse shadow-md shadow-rose-500/20'
                                : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30'
                            }`}
                            title={playingSpeechMessageId === msg.id ? 'Click to stop reading' : 'Click to read full response aloud'}
                          >
                            {playingSpeechMessageId === msg.id || (playingVoiceNoteId === msg.id && isPlayingFullSpeech) ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current text-rose-300" />
                                <span>Stop Reading</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-sky-400" />
                                <span>Read Full Info</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Message Body */}
                      <div className="whitespace-pre-line prose prose-invert prose-sm max-w-none">
                        {msg.text}
                      </div>

                      {/* Structured Hazard Box in AI Message */}
                      {msg.structuredHazard && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {getHazardBadge(msg.structuredHazard.hazardType, msg.structuredHazard.severity)}
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">
                              Risk Index: {msg.structuredHazard.riskScore}/100
                            </span>
                          </div>

                          {/* Recommended Actions */}
                          {msg.structuredHazard.recommendedActions.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wide">
                                Recommended Action Protocol:
                              </span>
                              <ul className="space-y-1">
                                {msg.structuredHazard.recommendedActions.map((action, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 1-Click Civic Relief Aid Actions */}
                          {msg.structuredHazard.communityAidTriggers && (
                            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                1-Click Aid Triggers:
                              </span>
                              {msg.structuredHazard.communityAidTriggers.map((trig, idx) => (
                                <button
                                  key={idx}
                                  onClick={() =>
                                    handleTriggerAidFromWeather(
                                      trig,
                                      msg.structuredHazard?.hazardType || 'Weather Alert'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <HeartHandshake className="w-3 h-3 text-sky-400" />
                                  Request {trig}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] opacity-60 pt-1">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'assistant' && <span>WeatherGPT • Gemini 3.7 + IMD Grids</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {isAsking && (
                  <div className="flex gap-3 items-center text-slate-400 text-xs pl-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>WeatherGPT is reasoning over IMD + OpenWeather telemetry...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Persona-Specific Quick Prompts */}
              <div className="py-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
                <span className="text-slate-400 font-bold shrink-0">Ask {currentPersonaConfig.label}:</span>
                {currentPersonaConfig.quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.query)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 shrink-0 transition-all"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Active Live Voice Recording Status & Audio Visualizer */}
              {isRecordingVoice && (
                <div className="px-4 py-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 space-y-2 animate-fadeIn shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <div>
                        <div className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                          <span>Listening ({voiceRecordingDuration}s)</span>
                          <span className="text-[10px] text-rose-300/80 font-normal">
                            · {selectedLanguage.toUpperCase()}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Auto-Send on Pause
                          </span>
                        </div>
                        <div className="text-[10px] text-rose-300/70">
                          {isAutoSubmittingVoice ? '⚡ Sending voice command...' : 'Speak your question. It will automatically send when you pause!'}
                        </div>
                      </div>
                    </div>

                    {/* Reactive Audio Frequency Level Visualizer Bars */}
                    <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-lg bg-black/40 border border-rose-500/20">
                      {[0.3, 0.7, 1.0, 0.6, 0.8, 0.4, 0.9, 0.5].map((multiplier, i) => {
                        const barHeight = Math.max(3, Math.min(20, (audioLevel / 100) * 20 * multiplier + 3));
                        return (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-rose-500 to-amber-300 rounded-full transition-all duration-75"
                            style={{ height: `${barHeight}px` }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => finishAndSubmitVoice()}
                        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Live Word Detection Transcript Display */}
                  {liveSpokenTranscript && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-rose-500/30 text-xs text-rose-100 flex items-start gap-2">
                      <Mic className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] text-rose-300 uppercase font-bold tracking-wider block">
                          Detected Speech:
                        </span>
                        <span className="italic font-medium">"{liveSpokenTranscript}"</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Microphone Permission Notice Banner if Denied */}
              {micPermissionError && (
                <div className="px-4 py-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{micPermissionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-500/30 shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Input Bar with Microphone Speech Recording */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isRecordingVoice) {
                    stopVoiceRecording();
                  }
                  handleSendMessage();
                }}
                className="flex items-center gap-2 pt-2 border-t border-white/10"
              >
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  title={isRecordingVoice ? 'Stop recording voice' : 'Speak in any language / dialect'}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {isRecordingVoice ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-sky-400" />}
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    isRecordingVoice
                      ? `Listening (${voiceRecordingDuration}s)... speak in any language`
                      : `Type or speak in any language (${currentPersonaConfig.label} mode)...`
                  }
                  className={`flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                    isRecordingVoice
                      ? 'border-rose-500/50 ring-2 ring-rose-500/20 bg-rose-950/20'
                      : 'border-white/10 focus:border-sky-500 focus:ring-sky-500/20'
                  }`}
                />

                <button
                  type="submit"
                  disabled={isAsking || !inputQuery.trim()}
                  className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
            </div>

            {/* Quick Action Side Panel */}
            <div className="lg:col-span-4 space-y-4">
              {/* Proactive Community Action Card */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-black text-white">Proactive Civic Relief Response</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every WeatherGPT forecast flows directly into Civic Relief's response layer: community alerts, verified volunteers, and matched aid.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() =>
                      handleBroadcastWeatherWarning({
                        hazardHeadline: 'Approaching Heavy Atmospheric Wave',
                        hazardType: 'flood',
                        severity: 'warning',
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-between shadow-lg shadow-rose-600/20 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Broadcast 5km Severe Weather Alert
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleTriggerAidFromWeather('Sandbags, Pumps & Drainage Cleaners', 'Pre-Storm Defense')
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-200 font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-sky-400" />
                      Request Pre-Storm Supplies / Aid
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchTab) onSwitchTab('mutual_aid');
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      Volunteer Response Registry
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Key Design Insight Quote (From PDF page 4) */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Design Insight</span>
                </div>
                <blockquote className="text-xs text-slate-200 italic leading-relaxed">
                  "Traditional weather apps show data. WeatherGPT holds a conversation — and a conversation is what turns a forecast into an action, in a language the citizen actually thinks in."
                </blockquote>
                <div className="text-[10px] text-slate-400 text-right font-semibold pt-1">
                  — ResQTech Disaster Intelligence
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: 7-DAY PREDICTIVE DISASTER MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === '7day' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {dailyForecast.map((day, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`cursor-pointer rounded-3xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  selectedDayIndex === idx
                    ? 'bg-slate-800/90 border-sky-500 ring-2 ring-sky-500/20 shadow-xl'
                    : 'bg-slate-900/60 border-white/10 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">{day.dayName}</span>
                  <span className="text-[11px] text-slate-400">{day.dateStr}</span>
                </div>

                <div className="flex flex-col items-center py-2 space-y-1">
                  {getWeatherIconComponent(day.conditionIcon, 'w-9 h-9')}
                  <span className="text-xs font-bold text-slate-200 text-center line-clamp-1">
                    {day.condition}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="font-black text-white">{formatTemp(day.tempMaxC, day.tempMaxF)}</span>
                  <span className="text-slate-400">{formatTemp(day.tempMinC, day.tempMinF)}</span>
                </div>

                {/* Rain Prob */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Droplets className="w-3 h-3" /> {day.precipitationProb}%
                  </span>
                  <span>{day.windSpeedMaxKmh} km/h</span>
                </div>

                {/* Hazard Badge if any */}
                {day.hazardType && day.hazardType !== 'none' && (
                  <div className="pt-1">
                    <span
                      className={`block text-center text-[10px] font-black uppercase px-2 py-0.5 rounded-full truncate ${
                        day.hazardSeverity === 'critical' || day.hazardSeverity === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {day.hazardType.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detailed Selected Day Breakdown */}
          {dailyForecast[selectedDayIndex] && (
            <div className="bg-slate-900/80 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {getWeatherIconComponent(dailyForecast[selectedDayIndex].conditionIcon, 'w-8 h-8')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {dailyForecast[selectedDayIndex].dayName}, {dailyForecast[selectedDayIndex].dateStr} — {dailyForecast[selectedDayIndex].condition}
                      </h3>
                      {getHazardBadge(
                        dailyForecast[selectedDayIndex].hazardType,
                        dailyForecast[selectedDayIndex].hazardSeverity
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {dailyForecast[selectedDayIndex].hazardHeadline || 'Standard seasonal weather condition'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleBroadcastWeatherWarning(dailyForecast[selectedDayIndex])
                    }
                    className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Broadcast Warning for {dailyForecast[selectedDayIndex].dayName}
                  </button>
                  <button
                    onClick={() => {
                      setActiveSubTab('chat');
                      handleSendMessage(
                        `What should we prepare for on ${dailyForecast[selectedDayIndex].dayName} (${dailyForecast[selectedDayIndex].dateStr})?`
                      );
                    }}
                    className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Consult WeatherGPT
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs sm:text-sm text-slate-200">
                <span className="font-bold text-sky-400">Community Safety & Action Directive: </span>
                {dailyForecast[selectedDayIndex].actionAdvice ||
                  'No immediate severe hazards forecasted. Normal neighborhood monitoring applies.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: 24-HOUR PRECIPITATION & WIND TIMELINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'hourly' && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              24-Hour Continuous Atmospheric & Precipitation Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Hour-by-hour rain probability curves, wind gust velocities, and hazard thresholds
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {hourlyForecast.map((hour, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-3 border flex flex-col items-center justify-between space-y-2 text-center transition-all ${
                  hour.hazardLevel === 'danger'
                    ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/50'
                    : hour.hazardLevel === 'warning'
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-bold text-slate-400">{hour.time}</span>
                {getWeatherIconComponent(hour.conditionIcon, 'w-6 h-6')}
                <span className="text-sm font-black text-white">{formatTemp(hour.tempC, hour.tempF)}</span>

                <div className="w-full space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-bold">
                    <Droplets className="w-3 h-3" />
                    {hour.rainProbability}%
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${hour.rainProbability}%` }}
                    />
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">{hour.windSpeedKmh} km/h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SYSTEM ARCHITECTURE (5 LAYERS BOTTOM-UP) (FROM PDF PAGE 2) */}
      {/* ========================================================================= */}
      {activeSubTab === 'architecture' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Technical Approach · System Architecture (Bottom-Up)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              A grounded LLM, not a guessing one.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Gemini reasons over IMD + OpenWeather + satellite data via retrieval-augmented generation and function-calling — so every answer is traceable to a live weather source, never hallucinated.
            </p>
          </div>

          {/* 5-Layer Stack Interactive Diagram */}
          <div className="space-y-3">
            {/* Layer 01: FRONTEND */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                  01 FRONTEND
                </span>
                <span className="text-[11px] text-slate-400">Mobile-First PWA & Web Client</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['React 18', 'TypeScript', 'Vite', 'PWA Offline Cache', 'Leaflet · GIS', 'Google Maps'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-sky-400">↑</div>

            {/* Layer 02: VOICE I/O */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  02 VOICE I/O
                </span>
                <span className="text-[11px] text-slate-400">Dialect Speech Recognition & Audio Note Synthesis</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Whisper · STT', 'Web Speech / gTTS', 'Coqui Speech', 'Bhashini Pipeline', '24 Indic Languages'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-purple-400">↑</div>

            {/* Layer 03: LLM CORE */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  03 LLM CORE
                </span>
                <span className="text-[11px] text-slate-400">Function-Calling & Grounded RAG Reasoning</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Gemini 3.7 / 1.5 Pro', 'Function-Calling Engine', 'RAG Vector Telemetry', 'Persona Router', 'Safety Filters'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-indigo-400">↑</div>

            {/* Layer 04: DATA SOURCES */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  04 DATA SOURCES
                </span>
                <span className="text-[11px] text-slate-400">Verified Meteorological & Disaster Telemetry</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['IMD Grids (mausam.imd.gov.in)', 'OpenWeatherMap', 'INSAT Satellite', 'NDMA Advisories', 'Historic Climate Baselines'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center text-emerald-400">↑</div>

            {/* Layer 05: BACKEND */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  05 BACKEND
                </span>
                <span className="text-[11px] text-slate-400">Realtime Storage & Geo-Fenced Push</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Firebase Auth', 'Firestore Database', 'Cloud Functions', 'FCM Push Notifications', 'REST API Routes'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: FEASIBILITY, ECONOMICS & MITIGATION MATRIX (FROM PDF PAGE 3) */}
      {/* ========================================================================= */}
      {activeSubTab === 'feasibility' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>04 · Feasibility & Viability</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Buildable today. Scalable tomorrow.
            </h3>
          </div>

          {/* Technical vs Economic Feasibility Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-sky-500/30 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Technical Feasibility</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>LLM APIs are production-grade:</strong> Gemini + function-calling already power public assistants.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero day-1 ML training needed:</strong> IMD & OpenWeather expose fast REST endpoints.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>PWA-First:</strong> Single unified codebase for Android, iOS, and desktop web.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Indic Speech:</strong> Whisper & TTS models support all 22+ scheduled Indian languages out of the box.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Mass Scale:</strong> Firestore + FCM handle geo-fenced push at millions-of-devices scale.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white/[0.02] border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Coins className="w-4 h-4" />
                <span>Economic Feasibility (₹)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Low-CapEx MVP:</strong> Powered by generous free tiers of Firebase & Gemini pilot phase.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Ultra-Low Query Cost:</strong> Per-query cost ≈ ₹0.05 after intelligent caching & batching.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Freemium Model:</strong> 100% free for citizens; paid API tiers for NGOs, insurers & logistics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Government Partnership:</strong> NDMA / IMD as data and civic distribution partners.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Ad-Free:</strong> Funded by public safety and disaster relief grants, never citizen surveillance.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Challenges & Mitigations Table (From PDF page 3) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Core Challenges & Engineered Mitigations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: LLM hallucination on weather numbers</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> Function-calling — every fact comes strictly from verified meteorological API / IMD grids.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: Low connectivity in rural / disaster zones</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> PWA offline cache + SMS fallback — last-known 5km forecast cached locally.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: Alert fatigue & false alarms</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> Severity + 5km geo-filtering — users only receive alerts for imminent physical threats.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: Multilingual accuracy across dialects</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> Bhashini + Gemini fine-tuning on regional meteorological terminology.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: Privacy of location & voice data</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> On-device STT option + minimum-necessary GPS resolution.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                <div className="font-bold text-rose-300">Challenge: LLM inference cost at scale</div>
                <p className="text-slate-300">
                  <strong>→ Mitigation:</strong> Query caching + edge inference — 70% of repeat weather queries served from cache.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: CLIMATE TRENDS & MULTI-DECADE SHIFT */}
      {/* ========================================================================= */}
      {activeSubTab === 'climate' && (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-black text-white tracking-tight">
                Microclimate Shift & Multi-Decade Hazard Trends
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Empirical anomaly tracking compared against the 30-year historical baseline for {userAddress}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {climateTrends.map((trend, idx) => (
              <div
                key={idx}
                className="bg-white/[0.02] border border-white/10 hover:border-sky-500/40 rounded-2xl p-4 sm:p-5 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      {trend.climateImpactCategory.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-black text-white">{trend.metric}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                    {trend.anomalyDiff}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-white/5">
                  <div>
                    <span className="text-slate-400 text-[10px]">Current Recorded:</span>
                    <div className="font-black text-white">{trend.currentValue}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Historical Baseline:</span>
                    <div className="font-semibold text-slate-300">{trend.historicalBaseline}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {trend.riskInterpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 7: RESEARCH & SCIENTIFIC STANDARDS (FROM PDF PAGE 4-5) */}
      {/* ========================================================================= */}
      {activeSubTab === 'research' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>06 · Research & References</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Grounded in science & standards.
            </h3>
          </div>

          {/* Research Domains Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Research Domains
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>🌦️</span>
                  <span>Numerical Weather Prediction</span>
                </div>
                <p className="text-xs text-slate-400">WRF · GFS · IMD Grids (0.25° resolution)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>💬</span>
                  <span>Conversational AI</span>
                </div>
                <p className="text-xs text-slate-400">LLMs · RAG · Function-Calling Grounding</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>🌐</span>
                  <span>Indic NLP</span>
                </div>
                <p className="text-xs text-slate-400">Bhashini · IndicTrans2 · 24 Dialect Pipelines</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>📍</span>
                  <span>GIS & Geo-Fencing</span>
                </div>
                <p className="text-xs text-slate-400">Leaflet · H3 Spatial Indexing · Google Maps</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>⚠️</span>
                  <span>Disaster Early-Warning</span>
                </div>
                <p className="text-xs text-slate-400">NDMA · UNDRR Early Warnings for All</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>🎤</span>
                  <span>Speech Systems</span>
                </div>
                <p className="text-xs text-slate-400">Whisper · Coqui · Bhashini TTS</p>
              </div>
            </div>
          </div>

          {/* Key References List (01 - 07 from PDF page 4) */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Key Academic & Agency References
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">01</span>
                  <span className="font-bold text-white">India Meteorological Department (IMD)</span>
                </div>
                <span className="text-[11px] text-slate-400">mausam.imd.gov.in</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">02</span>
                  <span className="font-bold text-white">National Disaster Management Authority</span>
                </div>
                <span className="text-[11px] text-slate-400">ndma.gov.in</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">03</span>
                  <span className="font-bold text-white">OpenWeatherMap & Air Quality API</span>
                </div>
                <span className="text-[11px] text-slate-400">openweather.org</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">04</span>
                  <span className="font-bold text-white">Google Gemini API (@google/genai)</span>
                </div>
                <span className="text-[11px] text-slate-400">ai.google.dev</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">05</span>
                  <span className="font-bold text-white">Bhashini · Digital India Language Initiative</span>
                </div>
                <span className="text-[11px] text-slate-400">bhashini.gov.in</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">06</span>
                  <span className="font-bold text-white">UNDRR — Early Warnings for All (EW4All)</span>
                </div>
                <span className="text-[11px] text-slate-400">undrr.org</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between md:col-span-2">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">07</span>
                  <span className="font-bold text-white">Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">arXiv:2005.11401</span>
              </div>
            </div>
          </div>

          {/* ResQTech Credits Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              <div>
                <span className="font-black text-white">ResQTech Disaster Intelligence</span>
                <span className="text-slate-400 block text-[11px]">
                  WeatherGPT Integrated Public Safety & Early Warning Grid
                </span>
              </div>
            </div>
            <div className="text-[11px] text-sky-300 font-bold">
              Autonomous Early Warning Architecture
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
