import React, { useState } from 'react';
import {
  HeartHandshake,
  Home,
  Users,
  Utensils,
  Shirt,
  HeartPulse,
  Zap,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
  Send,
  Shield,
  Scale,
  ArrowLeft,
  Lock,
  Flame,
} from 'lucide-react';
import {
  HelpRequest,
  VolunteerOffer,
  AidCategory,
  AidUrgency,
  Coordinates,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  updateHelpRequestStatusDoc,
  deleteHelpRequestDoc,
  PUBLIC_COMMAND_NAME,
} from '../../lib/firebase';

interface MutualAidModuleProps {
  helpRequests: HelpRequest[];
  volunteers: VolunteerOffer[];
  userLocation: Coordinates;
  userAddress?: string;
  onRequestHelp: (request: Omit<HelpRequest, 'id' | 'createdAt' | 'offersCount' | 'status'>) => void;
  onOfferVolunteer: (offer: Omit<VolunteerOffer, 'id' | 'joinedDate' | 'missionsCompleted'>) => void;
  onPledgeHelp: (requestId: string, volunteerName: string) => void;
  onBackToMap?: () => void;
  onOpenWildfireModule?: () => void;
}

export const MutualAidModule: React.FC<MutualAidModuleProps> = ({
  helpRequests,
  volunteers,
  userLocation,
  userAddress = 'Your Current Area',
  onRequestHelp,
  onOfferVolunteer,
  onPledgeHelp,
  onBackToMap,
  onOpenWildfireModule,
}) => {
  const { currentUser, isAuthorOrAdmin, setIsRulesModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<'board' | 'request' | 'offer'>('board');
  const [categoryFilter, setCategoryFilter] = useState<AidCategory | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<AidUrgency | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Request Aid Form State
  const [reqName, setReqName] = useState(currentUser?.displayName || '');
  const [reqPhone, setReqPhone] = useState(currentUser?.phoneNumber || '');
  const [reqLocation, setReqLocation] = useState(userAddress);
  const [reqCategory, setReqCategory] = useState<AidCategory>('shelter');
  const [reqSubCategory, setReqSubCategory] = useState('');
  const [reqUrgency, setReqUrgency] = useState<AidUrgency>('within_2_hours');
  const [reqPeopleCount, setReqPeopleCount] = useState<number>(2);
  const [reqDescription, setReqDescription] = useState('');
  const [reqSpecialNeeds, setReqSpecialNeeds] = useState<string[]>([]);
  const [specialNeedInput, setSpecialNeedInput] = useState('');

  // Volunteer Offer Form State
  const [volName, setVolName] = useState(currentUser?.displayName || '');
  const [volPhone, setVolPhone] = useState(currentUser?.phoneNumber || '');
  const [volLocation, setVolLocation] = useState(userAddress);
  const [volSkills, setVolSkills] = useState<string[]>(['First-Aid / CPR', 'Wildfire Evacuation Transport']);
  const [volCapacity, setVolCapacity] = useState('');
  const [volRadius, setVolRadius] = useState<number>(10);

  // Success Feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick category items
  const categories: { key: AidCategory; label: string; icon: any; color: string }[] = [
    { key: 'shelter', label: 'Emergency Shelter', icon: Home, color: 'text-emerald-400' },
    { key: 'wildfire_evac', label: 'Wildfire / Evacuation', icon: Flame, color: 'text-orange-400' },
    { key: 'medical', label: 'Medical & First Aid', icon: HeartPulse, color: 'text-rose-400' },
    { key: 'food_water', label: 'Food & Clean Water', icon: Utensils, color: 'text-amber-400' },
    { key: 'manpower', label: 'Manpower / Rescue', icon: Users, color: 'text-blue-400' },
    { key: 'clothing', label: 'Clothing & Blankets', icon: Shirt, color: 'text-purple-400' },
    { key: 'power_transport', label: 'Power & Transport', icon: Zap, color: 'text-cyan-400' },
  ];

  const handleAddSpecialNeed = () => {
    if (specialNeedInput.trim() && !reqSpecialNeeds.includes(specialNeedInput.trim())) {
      setReqSpecialNeeds([...reqSpecialNeeds, specialNeedInput.trim()]);
      setSpecialNeedInput('');
    }
  };

  const handleRemoveSpecialNeed = (item: string) => {
    setReqSpecialNeeds(reqSpecialNeeds.filter((n) => n !== item));
  };

  const handleToggleVolunteerSkill = (skill: string) => {
    if (volSkills.includes(skill)) {
      setVolSkills(volSkills.filter((s) => s !== skill));
    } else {
      setVolSkills([...volSkills, skill]);
    }
  };

  const handleSubmitHelpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqDescription) return;

    onRequestHelp({
      userId: currentUser?.uid || `anon-${Date.now()}`,
      authorEmail: currentUser?.email || undefined,
      authorName: reqName,
      requesterName: reqName,
      phoneMasked: reqPhone || '+1 (555) •••-1122',
      locationName: reqLocation || userAddress,
      coordinates: {
        lat: userLocation.lat + (Math.random() * 0.006 - 0.003),
        lng: userLocation.lng + (Math.random() * 0.006 - 0.003),
      },
      category: reqCategory,
      subCategory: reqSubCategory || reqCategory.replace(/_/g, ' ').toUpperCase(),
      urgency: reqUrgency,
      peopleCount: reqPeopleCount,
      description: reqDescription,
      specialNeeds: reqSpecialNeeds,
    });

    setSuccessToast('Mutual Aid request published! Verified volunteers and nearby neighbors notified.');
    setActiveTab('board');
    setReqDescription('');
    setReqSpecialNeeds([]);
  };

  const handleCloseRequest = async (id: string) => {
    try {
      await updateHelpRequestStatusDoc(id, 'fulfilled');
      setSuccessToast('Help request successfully marked fulfilled and closed!');
    } catch (err: any) {
      alert(err.message || 'Failed to close request');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to remove this help request?')) return;
    try {
      await deleteHelpRequestDoc(id);
      setSuccessToast('Help request deleted.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete request');
    }
  };

  const handleSubmitVolunteerOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volCapacity) return;

    onOfferVolunteer({
      volunteerName: volName,
      phoneMasked: volPhone || '+1 (555) •••-9933',
      roleSkills: volSkills,
      coordinates: userLocation,
      locationName: volLocation || userAddress,
      radiusCoveredKm: volRadius,
      capacityDetails: volCapacity,
      isAvailable: true,
      verifiedStatus: true,
    });

    setSuccessToast('🛡️ Thank you! You are now registered as an active community responder.');
    setVolName('');
    setVolCapacity('');
    setActiveTab('board');
  };

  // Filter requests
  const filteredRequests = helpRequests.filter((req) => {
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (urgencyFilter !== 'all' && req.urgency !== urgencyFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.description.toLowerCase().includes(q) ||
        req.subCategory.toLowerCase().includes(q) ||
        req.locationName.toLowerCase().includes(q) ||
        req.requesterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header Banner with Back to Map Navigation */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBackToMap && (
                <button
                  onClick={onBackToMap}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all mr-1"
                  title="Back to Map"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Back to Map</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider">
                Direct Mutual Aid Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Community Help & Volunteer Aid Logistics
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Connect directly with neighbors offering emergency shelter, food, supplies, and manpower in your area.
            </p>
          </div>

          {/* Action Tabs */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'board'
                  ? 'bg-emerald-500 text-black shadow-lg font-extrabold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              Aid Board ({helpRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('request')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'request'
                  ? 'bg-amber-400 text-black shadow-lg font-extrabold'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>I Need Help</span>
            </button>

            <button
              onClick={() => setActiveTab('offer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'offer'
                  ? 'bg-cyan-400 text-black shadow-lg font-extrabold'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>I Can Help</span>
            </button>

            {onOpenWildfireModule && (
              <button
                onClick={onOpenWildfireModule}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/40 text-xs font-bold transition-all shadow-md"
                title="Open Wildfire Spotter & Perimeter Defense"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Wildfire Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: AID BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Rules & Accuracy Banner */}
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Scale className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-300">CIVIC RULES & STATUTORY NOTICE:</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  False or misleading crisis posts are strictly prohibited and subject to civil penalties. Only original authors or authorized Admin ({PUBLIC_COMMAND_NAME}) can mark requests resolved.
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

          {/* Category Filter Pills & Search */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.08]'
                }`}
              >
                All Aid ({helpRequests.length})
              </button>

              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      categoryFilter === cat.key
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search aid requests..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-300 text-xs focus:outline-none"
              >
                <option value="all" className="bg-slate-900 text-slate-200">All Urgencies</option>
                <option value="immediate_life_threat" className="bg-slate-900 text-slate-200">🚨 Life Threat (Immediate)</option>
                <option value="within_2_hours" className="bg-slate-900 text-slate-200">⚡ Within 2 Hours</option>
                <option value="today" className="bg-slate-900 text-slate-200">🕒 Today</option>
                <option value="flexible" className="bg-slate-900 text-slate-200">📅 Flexible</option>
              </select>
            </div>
          </div>

          {/* Aid Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => {
              const isUrgent = req.urgency === 'immediate_life_threat';
              const isFulfilled = req.status === 'fulfilled';
              const isUserAuthor = isAuthorOrAdmin(req.userId, req.authorEmail);

              return (
                <div
                  key={req.id}
                  className={`bg-white/[0.04] backdrop-blur-xl border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
                    isFulfilled
                      ? 'border-white/5 opacity-60'
                      : isUrgent
                      ? 'border-rose-500/40 bg-rose-500/[0.03]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                              isUrgent
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {req.urgency.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {req.createdAt || 'Recent'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">{req.subCategory}</h4>
                      </div>

                      <span className="text-xl">
                        {categories.find((c) => c.key === req.category)?.label ? '🤝' : '🆘'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">{req.description}</p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/5">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {req.locationName}
                      </span>
                      <span className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-lg border border-white/5">
                        <Users className="w-3 h-3 text-blue-400" />
                        {req.peopleCount} People
                      </span>
                    </div>

                    {req.specialNeeds && req.specialNeeds.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {req.specialNeeds.map((need, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-200 border border-amber-500/30 text-[10px]"
                          >
                            ⚠️ {need}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <span>Requester: </span>
                      <span className="text-white font-medium">{req.requesterName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUserAuthor ? (
                        <div className="flex items-center gap-1.5">
                          {!isFulfilled && (
                            <button
                              onClick={() => handleCloseRequest(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              Mark Fulfilled
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="px-2 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onPledgeHelp(req.id, currentUser?.displayName || 'A Neighbor')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all flex items-center gap-1"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Pledge Aid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRequests.length === 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs space-y-2">
              <HeartHandshake className="w-8 h-8 mx-auto text-slate-500" />
              <p className="font-bold text-slate-300">No active aid requests matching filters.</p>
              <p>Be the first to post if you or a neighbor needs emergency support in your area.</p>
              <button
                onClick={() => setActiveTab('request')}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-400 text-black font-bold"
              >
                Post an Aid Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REQUEST AID FORM */}
      {activeTab === 'request' && (
        <div className="max-w-2xl mx-auto bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                Emergency Mutual Aid Form
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Request Emergency Assistance</h3>
            </div>
            <button
              onClick={() => setActiveTab('board')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Aid Board</span>
            </button>
          </div>

          <form onSubmit={handleSubmitHelpRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Name / Household</label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Your Location / Neighborhood</label>
              <input
                type="text"
                value={reqLocation}
                onChange={(e) => setReqLocation(e.target.value)}
                placeholder="e.g. 42 Oak Ridge Way, Apt 3B"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Aid Category</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as AidCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key} className="bg-slate-900 text-slate-200">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Urgency Level</label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value as AidUrgency)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="immediate_life_threat" className="bg-slate-900 text-rose-300">
                    🚨 Immediate Life Threat
                  </option>
                  <option value="within_2_hours" className="bg-slate-900 text-amber-300">
                    ⚡ Within 2 Hours
                  </option>
                  <option value="today" className="bg-slate-900 text-slate-200">
                    🕒 Today
                  </option>
                  <option value="flexible" className="bg-slate-900 text-slate-200">
                    📅 Flexible (Next 24-48h)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Detailed Description of Needs</label>
              <textarea
                rows={3}
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="Describe what items or help you need..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" /> Broadcast Aid Request to Area
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: OFFER AID / VOLUNTEER FORM */}
      {activeTab === 'offer' && (
        <div className="max-w-2xl mx-auto bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                Community Volunteer Registration
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Offer Aid, Shelter, or Rescue Skills</h3>
            </div>
            <button
              onClick={() => setActiveTab('board')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Aid Board</span>
            </button>
          </div>

          <form onSubmit={handleSubmitVolunteerOffer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Name / Group</label>
                <input
                  type="text"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  placeholder="e.g. Dr. Jordan Reed"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={volPhone}
                  onChange={(e) => setVolPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Your Skills / Resources</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'First-Aid / CPR',
                  '4x4 Vehicle Transport',
                  'Emergency Bed / Room',
                  'Hot Meal Preparation',
                  'Chainsaw / Debris Tools',
                  'Search Drone Operator',
                  'Bilingual Translation',
                  'Backup Generator / Power',
                  'Boat / Water Rescue',
                ].map((skill) => {
                  const isChecked = volSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => handleToggleVolunteerSkill(skill)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-[11px] font-semibold transition-all ${
                        isChecked
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{skill}</span>
                      <span>{isChecked ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Capacity & Equipment Details</label>
              <textarea
                rows={2}
                value={volCapacity}
                onChange={(e) => setVolCapacity(e.target.value)}
                placeholder="e.g. Ford F-150 with winch, can host 2 people, 5kW generator..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Shield className="w-4 h-4" /> Register as Active Responder
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
