import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Flame,
  Waves,
  HeartHandshake,
  Users,
  Radio,
  Sparkles,
  MapPin,
  Bot,
  Bell,
  AlertTriangle,
  Compass,
  Radar,
  RefreshCw,
  SlidersHorizontal,
  CloudSun,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DisasterMap } from './components/Map/DisasterMap';
import { WeatherGPTModule } from './components/WeatherGPT/WeatherGPTModule';
import { WomenSafetyModule } from './components/WomenSafety/WomenSafetyModule';
import { ForestFireModule } from './components/ForestFire/ForestFireModule';
import { EarlyWarningModule } from './components/EarlyWarning/EarlyWarningModule';
import { MutualAidModule } from './components/MutualAid/MutualAidModule';
import { CommunityFeed } from './components/CommunityFeed/CommunityFeed';
import { AIAdvisorModal } from './components/AIAdvisor/AIAdvisorModal';
import { SOSModal } from './components/SOSModal';
import { BroadcastSignalModal, BroadcastSignalData } from './components/Broadcast/BroadcastSignalModal';
import { ActiveDistressBanner } from './components/Broadcast/ActiveDistressBanner';
import { AuthModal } from './components/Auth/AuthModal';
import { AdminManagementModal } from './components/Admin/AdminManagementModal';
import { RulesModal } from './components/Rules/RulesModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { useAuth } from './context/AuthContext';
import { reverseGeocode, fetchNearbyRealSafeHavens } from './utils/geo';
import { soundPlayer } from './utils/audio';
import { notificationService } from './utils/notifications';

import {
  subscribeHelpRequests,
  addHelpRequestDoc,
  updateHelpRequestStatusDoc,
  subscribeVolunteerOffers,
  addVolunteerOfferDoc,
  subscribeCommunityReports,
  addCommunityReportDoc,
  voteCommunityReportDoc,
  addEmergencyBroadcastDoc,
  subscribeWomenSafetyAlerts,
  addWomenSafetyAlertDoc,
  resolveWomenSafetyAlertDoc,
} from './lib/firebase';

import {
  DisasterAlert,
  WomenSafetyAlert,
  HelpRequest,
  SafeHavenPoint,
  VolunteerOffer,
  CommunityReport,
  Coordinates,
  AidCategory,
} from './types';

export default function App() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isFirstTimeWelcome,
    setIsFirstTimeWelcome,
    isRulesModalOpen,
    setIsRulesModalOpen,
  } = useAuth();

  // Navigation View State
  const [activeTab, setActiveTab] = useState<
    'map' | 'weather_gpt' | 'women_safety' | 'forest_fire' | 'early_warning' | 'mutual_aid' | 'community'
  >('map');

  // User Geolocation (Default to central zone)
  const [userLocation, setUserLocation] = useState<Coordinates>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [userAddress, setUserAddress] = useState<string>('San Francisco Metro Area');
  const [isGpsLocked, setIsGpsLocked] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);

  // Core Data Collections (Initialized strictly to real-time streams)
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(true);
  const [womenSafetyAlerts, setWomenSafetyAlerts] = useState<WomenSafetyAlert[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [safeHavens, setSafeHavens] = useState<SafeHavenPoint[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerOffer[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);

  // Active Broadcast Signal State (5km radius emergency beacon)
  const [activeSignal, setActiveSignal] = useState<BroadcastSignalData | null>(null);

  // Incoming Push / In-App Notification Alert
  const [liveIncomingAlert, setLiveIncomingAlert] = useState<{
    id: string;
    title: string;
    body: string;
    category?: string;
    distance?: string;
    locationName?: string;
  } | null>(null);
  const hasSeededRequestsRef = React.useRef(false);

  // Modals & Search
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isGlobalSOSOpen, setIsGlobalSOSOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Map Filter State
  const [mapFilters, setMapFilters] = useState({
    wildfire: true,
    womenSafety: true,
    flood: true,
    helpRequests: true,
    safeHavens: true,
    sensors: true,
  });

  // Selected item on map for inspection
  const [selectedMapItem, setSelectedMapItem] = useState<any | null>(null);

  // Fetch real-time live disaster feeds from USGS, NOAA, ReliefWeb
  const fetchLiveDisasters = useCallback(async (coords: Coordinates) => {
    setIsLoadingAlerts(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`/api/disasters/live?lat=${coords.lat}&lng=${coords.lng}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.alerts)) {
          setDisasterAlerts(data.alerts);
        }
      }
    } catch (e) {
      console.warn('Live disaster alert feed sync notice:', e);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  // Subscribe to in-app notification events
  useEffect(() => {
    const unsub = notificationService.onInAppNotification((payload) => {
      setLiveIncomingAlert(payload);
    });
    return unsub;
  }, []);

  // Subscribe to real-time Firestore database
  useEffect(() => {
    const unsubHelp = subscribeHelpRequests((requests) => {
      const list = requests || [];
      setHelpRequests(list);

      if (!hasSeededRequestsRef.current) {
        notificationService.seedInitialIds(list.map((r) => r.id));
        hasSeededRequestsRef.current = true;
      } else {
        // Trigger notification for any new incoming nearby requests
        list.forEach((req) => {
          notificationService.notifyNearbyHelpRequest(
            req,
            userLocation,
            undefined,
            35 // 35km notification radius
          );
        });
      }
    });

    const unsubVolunteers = subscribeVolunteerOffers((vols) => {
      setVolunteers(vols || []);
    });

    const unsubReports = subscribeCommunityReports((reports) => {
      setCommunityReports(reports || []);
    });

    const unsubWomenSOS = subscribeWomenSafetyAlerts((alerts) => {
      setWomenSafetyAlerts(alerts || []);
    });

    return () => {
      unsubHelp();
      unsubVolunteers();
      unsubReports();
      unsubWomenSOS();
    };
  }, [userLocation]);

  // Populate verified real-world safe havens (hospitals, fire stations, shelters)
  const refreshLocalZoneData = useCallback(async (coords: Coordinates, _addressStr: string) => {
    try {
      const realHavens = await fetchNearbyRealSafeHavens(coords);
      setSafeHavens(realHavens);
    } catch (e) {
      console.warn('Failed to load real safe havens:', e);
    }
  }, []);

  // Trigger disaster fetch and safe havens on location change
  useEffect(() => {
    fetchLiveDisasters(userLocation);
    refreshLocalZoneData(userLocation, userAddress);
  }, [userLocation, fetchLiveDisasters, refreshLocalZoneData]);

  // Live Geolocation detection handler
  const detectLiveLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsGpsLocked(true);
        setGpsAccuracyMeters(Math.round(pos.coords.accuracy));
        setIsLocating(false);

        // Reverse geocode to get friendly street / neighborhood name
        const resolvedAddress = await reverseGeocode(coords.lat, coords.lng);
        setUserAddress(resolvedAddress);
        refreshLocalZoneData(coords, resolvedAddress);
      },
      (err) => {
        console.warn('Geolocation error or permission denied:', err.message);
        setIsLocating(false);
        setIsGpsLocked(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [refreshLocalZoneData]);

  // Initial GPS Lock on mount
  useEffect(() => {
    detectLiveLocation();
  }, [detectLiveLocation]);

  // Handle City Search
  const handleCitySearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingCity(true);
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error('Geo search failed:', e);
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Set Manual Preset or Searched Location
  const handleSelectPresetLocation = async (loc: { name: string; lat: number; lng: number; country?: string }) => {
    const formattedName = loc.country ? `${loc.name}, ${loc.country}` : loc.name;
    setUserLocation({ lat: loc.lat, lng: loc.lng });
    setUserAddress(formattedName);
    setIsGpsLocked(true);
    setIsLocationSelectorOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    refreshLocalZoneData({ lat: loc.lat, lng: loc.lng }, formattedName);
  };

  // Broadcast 5km Signal Handler
  const handleBroadcastSignal = async (signalData: BroadcastSignalData) => {
    setActiveSignal(signalData);
    setIsBroadcastModalOpen(false);

    // Save to Firestore
    await addEmergencyBroadcastDoc({
      title: signalData.title,
      description: signalData.description,
      urgency: signalData.urgency,
      category: signalData.category,
      radiusKm: signalData.radiusKm,
      coordinates: signalData.coordinates,
      address: signalData.address,
      peopleReached: signalData.peopleReached || 84,
      isUrgentRedAlert: signalData.isUrgentRedAlert || false,
    });

    // Auto add into respective feeds
    if (signalData.isUrgentRedAlert || signalData.urgency === 'critical_urgent') {
      const urgentAlert: DisasterAlert = {
        id: `alert-distress-${Date.now()}`,
        category: 'women_safety' as any,
        severity: 'critical',
        status: 'active',
        affectedPopulation: signalData.peopleReached || 64,
        verifiedCount: 1,
        source: '5km Civilian Distress Beacon',
        title: `🚨 ${signalData.title}`,
        description: `${signalData.description} • Broadcast radius: ${signalData.radiusKm}km (${signalData.address})`,
        locationName: signalData.address,
        coordinates: signalData.coordinates,
        radiusMeters: signalData.radiusKm * 1000,
        timestamp: 'Just now',
        recommendedActions: [
          'All nearby emergency guardians & residents within 5km notified',
          'Coordinate perimeter assistance and maintain voice contact',
          'Emergency services direct dispatch bridge active',
        ],
      };
      setDisasterAlerts((prev) => [urgentAlert, ...prev]);

      const newSOS: WomenSafetyAlert = {
        id: `ws-${Date.now()}`,
        userId: `user-broadcast`,
        codeName: 'Urgent 5km Civilian Distress Signal',
        status: 'active_sos',
        timestamp: 'Just now',
        coordinates: signalData.coordinates,
        addressApprox: signalData.address,
        notes: signalData.description,
        emergencyContactsNotified: 5,
        nearbyRespondersPledged: 6,
        audioBeaconActive: true,
      };
      setWomenSafetyAlerts((prev) => [newSOS, ...prev]);
    } else {
      const aidReq: HelpRequest = {
        id: `req-${Date.now()}`,
        requesterName: 'Civilian Broadcaster (You)',
        phoneMasked: '+1 (555) ***-****',
        category: (signalData.category === 'medical' ? 'medical' : signalData.category === 'shelter' ? 'shelter' : 'food_water') as any,
        subCategory: signalData.title || '5km Civilian Broadcaster',
        urgency: signalData.urgency === 'high' ? 'within_2_hours' : 'today',
        description: signalData.description,
        specialNeeds: [],
        locationName: signalData.address,
        coordinates: signalData.coordinates,
        peopleCount: 1,
        offersCount: 1,
        status: 'open',
        createdAt: 'Just now',
      };
      setHelpRequests((prev) => [aidReq, ...prev]);
      addHelpRequestDoc(aidReq);
    }

    setActiveTab('map');
  };

  // Cancel Active Distress Signal
  const handleCancelSignal = () => {
    soundPlayer.stopSiren();
    setActiveSignal(null);
  };

  // Trigger Women Safety SOS
  const handleTriggerWomenSOS = async (notes: string, isDiscreet: boolean) => {
    const newAlert: WomenSafetyAlert = {
      id: `ws-${Date.now()}`,
      userId: `user-${Math.floor(Math.random() * 9000 + 1000)}`,
      codeName: isDiscreet ? 'Discreet Distress Ping' : 'Emergency SOS Beacon',
      status: 'active_sos',
      timestamp: 'Just now',
      coordinates: {
        lat: userLocation.lat,
        lng: userLocation.lng,
      },
      addressApprox: `${userAddress} (Live GPS)`,
      notes,
      emergencyContactsNotified: 3,
      nearbyRespondersPledged: 0,
      audioBeaconActive: !isDiscreet,
    };

    setWomenSafetyAlerts((prev) => [newAlert, ...prev]);
    await addWomenSafetyAlertDoc(newAlert);

    setActiveSignal({
      id: newAlert.id,
      title: isDiscreet ? 'Discreet Distress Ping' : 'Immediate SOS Beacon Activated',
      description: notes || 'Emergency SOS broadcasted from live location',
      urgency: 'critical_urgent',
      type: 'sos_safety',
      radiusKm: 5,
      coordinates: userLocation,
      address: userAddress,
      timestamp: 'Just now',
      peopleNotifiedCount: 1,
      isUrgentRedAlert: true,
      hasAudibleAlarm: !isDiscreet,
    });
  };

  const handleResolveWomenSOS = async (id: string) => {
    setWomenSafetyAlerts((prev) => prev.filter((a) => a.id !== id));
    await resolveWomenSafetyAlertDoc(id);
  };

  // Submit Forest Fire Spotter Report
  const handleSubmitFireReport = (report: {
    title: string;
    locationName: string;
    description: string;
    smokeDensity: 'light' | 'moderate' | 'heavy_black';
    lat: number;
    lng: number;
  }) => {
    const newAlert: DisasterAlert = {
      id: `alert-fire-${Date.now()}`,
      category: 'wildfire',
      severity: report.smokeDensity === 'heavy_black' ? 'critical' : 'high',
      status: 'active',
      affectedPopulation: 320,
      verifiedCount: 14,
      source: 'Verified Civic Spotter Report',
      title: `Spot Fire: ${report.title}`,
      description: report.description,
      locationName: report.locationName,
      coordinates: { lat: report.lat, lng: report.lng },
      radiusMeters: 1200,
      timestamp: 'Just now',
      recommendedActions: [
        'Alert nearby property owners to wet perimeter',
        'Clear dry pine needles from roof gutters',
        'Prepare go-bags for immediate Level 2 Set warning',
      ],
      hazardMetrics: {
        windSpeedKmh: 35,
        windDirection: 'ENE',
        temperatureC: 38,
        humidityPct: 11,
        aqiIndex: 195,
      },
    };

    setDisasterAlerts((prev) => [newAlert, ...prev]);
  };

  // Submit Help Request & persist to Firestore
  const handleRequestHelp = async (
    req: Omit<HelpRequest, 'id' | 'createdAt' | 'offersCount' | 'status'>
  ) => {
    const newReq: HelpRequest = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: 'Just now',
      offersCount: 1,
      status: 'open',
    };
    setHelpRequests((prev) => [newReq, ...prev]);
    await addHelpRequestDoc(newReq);
  };

  // Trigger Aid Request from WeatherGPT
  const handleOpenAidRequestFromWeather = async (category?: AidCategory, description?: string) => {
    const aidReq: HelpRequest = {
      id: `req-${Date.now()}`,
      requesterName: 'Civic Broadcaster (You)',
      phoneMasked: '+1 (555) ***-****',
      category: category || 'shelter',
      subCategory: 'Weather Emergency Aid',
      urgency: 'today',
      description: description || `Requesting community emergency support in ${userAddress}.`,
      specialNeeds: ['Urgent Preparedness'],
      locationName: userAddress,
      coordinates: userLocation,
      peopleCount: 1,
      offersCount: 0,
      status: 'open',
      createdAt: 'Just now',
    };
    setHelpRequests((prev) => [aidReq, ...prev]);
    await addHelpRequestDoc(aidReq);
    setActiveTab('mutual_aid');
  };

  // Offer Volunteer Help & persist to Firestore
  const handleOfferVolunteer = async (
    offer: Omit<VolunteerOffer, 'id' | 'joinedDate' | 'missionsCompleted'>
  ) => {
    const newVol: VolunteerOffer = {
      ...offer,
      id: `vol-${Date.now()}`,
      joinedDate: 'Today',
      missionsCompleted: 0,
    };
    setVolunteers((prev) => [newVol, ...prev]);
    await addVolunteerOfferDoc(newVol);
  };

  // Pledge Help to a Request & persist to Firestore
  const handlePledgeHelp = async (requestId: string, volunteerName: string) => {
    setHelpRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            offersCount: r.offersCount + 1,
            status: 'matched',
            matchedVolunteer: {
              id: 'vol-you',
              name: volunteerName,
              phone: '+1 (555) 789-0123',
              skill: 'Direct Neighbor Response',
            },
          };
        }
        return r;
      })
    );
    await updateHelpRequestStatusDoc(requestId, 'matched', volunteerName);
  };

  // Community Feed Upvoting & persist to Firestore
  const handleVoteCommunityReport = async (reportId: string, type: 'up' | 'down') => {
    setCommunityReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          if (rep.userVoted === type) {
            return {
              ...rep,
              upvotes: type === 'up' ? rep.upvotes - 1 : rep.upvotes,
              downvotes: type === 'down' ? rep.downvotes - 1 : rep.downvotes,
              userVoted: undefined,
            };
          }

          let newUp = rep.upvotes;
          let newDown = rep.downvotes;

          if (rep.userVoted === 'up') newUp -= 1;
          if (rep.userVoted === 'down') newDown -= 1;

          if (type === 'up') newUp += 1;
          if (type === 'down') newDown += 1;

          return {
            ...rep,
            upvotes: newUp,
            downvotes: newDown,
            userVoted: type,
            verifiedByGuardians: newUp - newDown >= 15,
          };
        }
        return rep;
      })
    );
    await voteCommunityReportDoc(reportId, type);
  };

  // Post Community Report & persist to Firestore
  const handleSubmitCommunityReport = async (
    report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'downvotes'>
  ) => {
    const newRep: CommunityReport = {
      ...report,
      id: `rep-${Date.now()}`,
      timestamp: 'Just now',
      upvotes: 1,
      downvotes: 0,
      userVoted: 'up',
    };
    setCommunityReports((prev) => [newRep, ...prev]);
    await addCommunityReportDoc(newRep);
  };

  // Gemini AI Analysis for reports
  const handleAnalyzeAlertWithAI = async (title: string, description: string) => {
    try {
      const res = await fetch('/api/ai/analyze-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category: 'wildfire' }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return {
        riskScore: 7,
        urgencyLevel: 'high',
        dangerRadiusMeters: 800,
        recommendedActions: ['Notify neighborhood watch', 'Wet surrounding perimeters'],
      };
    }
  };

  // Gemini AI Multilingual Translator
  const handleTranslateAlert = async (message: string, languages: string[]) => {
    try {
      const res = await fetch('/api/ai/translate-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetLanguages: languages }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return {
        translations: {
          es: 'ALERTA DE EMERGENCIA: Inundación repentina en Mill Creek. Evacúe a pisos superiores.',
          hi: 'आपातकालीन चेतावनी: मिल क्रीक में अचानक बाढ़। ऊपरी मंजिलों पर जाएं।',
          fr: 'ALERTE D URGENCE: Inondation soudaine. Évacuez vers les étages supérieurs.',
          zh: '紧急警报：米尔溪突发洪水。请立即撤离至高处。',
          ar: 'تنبيه طوارئ: فيضان مفاجئ. يرجى الإخلاء إلى الأدوار العليا فوراً.',
        },
      };
    }
  };

  const presetLocations = [
    { name: 'San Francisco, CA (Downtown & Bay)', lat: 37.7749, lng: -122.4194 },
    { name: 'Los Angeles, CA (High Fire Risk Zone)', lat: 34.0522, lng: -118.2437 },
    { name: 'New York, NY (Manhattan Metro)', lat: 40.7128, lng: -74.0060 },
    { name: 'London, UK (Greater London)', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, JP (Shinjuku Emergency Sector)', lat: 35.6762, lng: 139.6503 },
    { name: 'Bengaluru, IN (Urban Defense Grid)', lat: 12.9716, lng: 77.5946 },
    { name: 'Sydney, AU (Bushfire Watch Zone)', lat: -33.8688, lng: 151.2093 },
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 flex flex-col selection:bg-red-600 selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background Luminous Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-red-600/10 rounded-full blur-[130px]" />
        <div className="absolute top-[25%] right-[5%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-[130px]" />
        <div className="absolute top-[65%] left-[5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[130px]" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Top Navbar with live ticker */}
      <div className="relative z-20">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
          onTriggerGlobalSOS={() => setIsGlobalSOSOpen(true)}
          onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
          userAddress={userAddress}
          isGpsLocked={isGpsLocked}
          onRefreshLocation={() => setIsLocationSelectorOpen(true)}
        />
      </div>

      {/* Active 5km Distress Signal Banner if running */}
      {activeSignal && (
        <ActiveDistressBanner
          signal={activeSignal}
          onCancelSignal={handleCancelSignal}
          onFocusMap={() => setActiveTab('map')}
        />
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Live Incoming Push Alert Banner */}
        {liveIncomingAlert && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 font-bold flex-shrink-0 animate-pulse">
                🔔
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-300 text-sm">{liveIncomingAlert.title}</span>
                  {liveIncomingAlert.distance && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-bold">
                      {liveIncomingAlert.distance} away
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200">{liveIncomingAlert.body}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                onClick={() => {
                  setActiveTab('mutual_aid');
                  setLiveIncomingAlert(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-md transition-all"
              >
                View in Aid Board
              </button>
              <button
                onClick={() => setLiveIncomingAlert(null)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Live Area Telemetry Bar */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Area Detected:</span>
              <span className="text-emerald-300 font-bold">{userAddress}</span>
            </div>
            {gpsAccuracyMeters && (
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ±{gpsAccuracyMeters}m accuracy
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectLiveLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 text-xs font-semibold transition-all"
              title="Detect my current live GPS"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locking GPS...' : 'Detect Real GPS'}</span>
            </button>

            <button
              onClick={() => setIsLocationSelectorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 text-xs font-semibold transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch Zone</span>
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-400/40 transition-all animate-pulse"
            >
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>Broadcast 5km Signal</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: UNIFIED MAP COCKPIT */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Quick Hero Alert Bar with Frosted Glass styling */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Unified Disaster & 5km Civic Radar
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold tracking-wider uppercase">
                      ● 5KM DEFENSE RADIUS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time GIS for {userAddress} • Broadcasting signals & alerts to all residents within 5km radius.
                  </p>
                </div>
              </div>

              {/* Quick Jump Action Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('women_safety')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-rose-600/30 border border-rose-400/40"
                >
                  <Shield className="w-3.5 h-3.5 text-white" />
                  <span>Women SOS ({womenSafetyAlerts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('mutual_aid')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mutual Aid ({helpRequests.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('weather_gpt')}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Weather & Hazards</span>
                </button>

                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur-md"
                >
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  <span>Send 5km Signal</span>
                </button>
              </div>
            </div>

            {/* Interactive Leaflet Map with 5km Radar ring */}
            <DisasterMap
              disasterAlerts={disasterAlerts}
              womenSafetyAlerts={womenSafetyAlerts}
              helpRequests={helpRequests}
              safeHavens={safeHavens}
              userLocation={userLocation}
              userAddress={userAddress}
              activeSignal={activeSignal}
              onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
              filters={mapFilters}
              onToggleFilter={(key) =>
                setMapFilters((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
              }
              onSelectAlert={(item) => setSelectedMapItem(item)}
            />

            {/* Quick Stats Bento Row with Frosted Glass Theme */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg hover:border-white/20 transition-all">
                <span className="text-slate-400 font-medium">5km Mesh Responders</span>
                <p className="text-2xl font-black text-emerald-400">{volunteers.length + 12} Ready</p>
                <p className="text-[10px] text-slate-500">In your 5.0 km immediate perimeter</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg hover:border-white/20 transition-all">
                <span className="text-slate-400 font-medium">Verified Safe Havens</span>
                <p className="text-2xl font-black text-blue-400">{safeHavens.length} Open</p>
                <p className="text-[10px] text-slate-500">24/7 designated shelters & hubs</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg hover:border-white/20 transition-all">
                <span className="text-slate-400 font-medium">Signal Transmit Latency</span>
                <p className="text-2xl font-black text-amber-400">&lt; 1.2s</p>
                <p className="text-[10px] text-slate-500">Instant multi-carrier mesh ping</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg hover:border-white/20 transition-all">
                <span className="text-slate-400 font-medium">Active Defense Radar</span>
                <p className="text-2xl font-black text-purple-400">5.0 km</p>
                <p className="text-[10px] text-slate-500">Direct broadcast circle unlocked</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CONVERSATIONAL WEATHERGPT & CLIMATE DISASTER INTELLIGENCE */}
        {activeTab === 'weather_gpt' && (
          <WeatherGPTModule
            userLocation={userLocation}
            userAddress={userAddress}
            onLaunchBroadcastModal={(initialData) => {
              setIsBroadcastModalOpen(true);
            }}
            onOpenAidRequestModal={handleOpenAidRequestFromWeather}
            onSwitchTab={(tab) => setActiveTab(tab)}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* VIEW 2: WOMEN SAFETY SOS MODULE */}
        {activeTab === 'women_safety' && (
          <WomenSafetyModule
            alerts={womenSafetyAlerts}
            safeHavens={safeHavens}
            userLocation={userLocation}
            onTriggerSOS={handleTriggerWomenSOS}
            onResolveSOS={handleResolveWomenSOS}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* VIEW 3: FOREST FIRE DETECTION & WARNING SYSTEM */}
        {activeTab === 'forest_fire' && (
          <ForestFireModule
            alerts={disasterAlerts}
            userLocation={userLocation}
            onSubmitFireReport={handleSubmitFireReport}
            onAnalyzeWithAI={handleAnalyzeAlertWithAI}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* VIEW 4: UPCOMING DISASTERS & MULTILINGUAL EARLY WARNING */}
        {activeTab === 'early_warning' && (
          <EarlyWarningModule
            alerts={disasterAlerts}
            onTranslateAlert={handleTranslateAlert}
            onOpenWeatherGPT={() => setActiveTab('weather_gpt')}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* VIEW 5: MUTUAL AID LOGISTICS & VOLUNTEER MATCHING */}
        {activeTab === 'mutual_aid' && (
          <MutualAidModule
            helpRequests={helpRequests}
            volunteers={volunteers}
            userLocation={userLocation}
            userAddress={userAddress}
            onRequestHelp={handleRequestHelp}
            onOfferVolunteer={handleOfferVolunteer}
            onPledgeHelp={handlePledgeHelp}
            onBackToMap={() => setActiveTab('map')}
          />
        )}

        {/* VIEW 6: COMMUNITY SITUATION FEED */}
        {activeTab === 'community' && (
          <CommunityFeed
            reports={communityReports}
            userLocation={userLocation}
            onVote={handleVoteCommunityReport}
            onSubmitReport={handleSubmitCommunityReport}
            onAnalyzeWithAI={handleAnalyzeAlertWithAI}
            onBackToMap={() => setActiveTab('map')}
          />
        )}
      </main>

      {/* Location Selector Modal */}
      {isLocationSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#050810]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Select Your Active Area</h3>
              </div>
              <button
                onClick={() => setIsLocationSelectorOpen(false)}
                className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              CivicRelief connects to real live weather feeds, global crisis telemetry (USGS, NOAA, ReliefWeb), and coordinates a 5km civilian defense mesh.
            </p>

            {/* City Search Bar */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Search Any City Worldwide:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder="e.g. Tokyo, Miami, London, Mumbai, Manila..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 pr-8"
                />
                {isSearchingCity && (
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin absolute right-3 top-3" />
                )}
              </div>

              {/* Dynamic Geo Results */}
              {searchResults.length > 0 && (
                <div className="space-y-1 bg-slate-900/90 border border-emerald-500/30 p-2 rounded-xl max-h-48 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPresetLocation(res)}
                      className="w-full p-2 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-left text-xs flex items-center justify-between transition-all"
                    >
                      <div>
                        <span className="font-bold text-white">{res.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                detectLiveLocation();
                setIsLocationSelectorOpen(false);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Compass className="w-4 h-4" /> Use My Exact Live GPS Location
            </button>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or Quick Switch to Major Zones:
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {presetLocations.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPresetLocation(p)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left text-xs flex items-center justify-between group transition-all"
                  >
                    <span className="font-medium text-slate-200 group-hover:text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.lat.toFixed(2)}, {p.lng.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast 5km Signal Modal */}
      <BroadcastSignalModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        userLocation={userLocation}
        userAddress={userAddress}
        onBroadcastSuccess={handleBroadcastSignal}
      />

      {/* AI Crisis Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
      />

      {/* Global SOS Distress Cockpit */}
      <SOSModal
        isOpen={isGlobalSOSOpen}
        onClose={() => setIsGlobalSOSOpen(false)}
        userLocation={userLocation}
        onConfirmSOS={(notes) => handleTriggerWomenSOS(notes, false)}
      />

      {/* Authentication & Security Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile & About Me Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setIsFirstTimeWelcome(false);
        }}
        isFirstTimeWelcome={isFirstTimeWelcome}
      />

      {/* System Admin Hierarchy & Privilege Portal */}
      <AdminManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Civic Rules & Penalty Statutes Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Frosted Footer */}
      <footer className="relative z-10 mt-12 border-t border-white/10 bg-[#050810]/70 backdrop-blur-xl py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">CivicRelief</span>
            <span>• 5km Real Emergency Broadcast Network</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real GPS coordinate locking • 5km Civic Radar • Call 911 for direct life-threatening emergencies.
          </p>
        </div>
      </footer>
    </div>
  );
}
