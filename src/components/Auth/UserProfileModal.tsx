import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Crown,
  CheckCircle,
  AlertCircle,
  Key,
  Calendar,
  MapPin,
  Heart,
  Save,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_NAME, MASTER_ADMIN_PHONE, MASTER_ADMIN_PASSWORD } from '../../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTimeWelcome?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  isFirstTimeWelcome = false,
}) => {
  const { currentUser, isMasterAdmin, isAdmin, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'id_card'>('details');

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'resident' | 'volunteer' | 'coordinator' | 'medical'>('resident');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setRole((currentUser.role as any) || 'resident');
      setBio(currentUser.bio || '');
      setAddress(currentUser.address || '');
      setEmergencyContactName(currentUser.emergencyContactName || '');
      setEmergencyContactPhone(currentUser.emergencyContactPhone || '');
      setBloodGroup(currentUser.bloodGroup || 'O+');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setFeedback({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        role,
        bio: bio.trim(),
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        bloodGroup,
      });
      setFeedback({
        type: 'success',
        message: 'Your profile details have been saved successfully!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsChangingPass(true);
    setFeedback(null);
    try {
      await updateUserProfile({
        newPassword: newPassword.trim(),
      });
      setFeedback({
        type: 'success',
        message: 'Your password has been successfully updated!',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update password. You may need to sign in again.',
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#080d1a] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-5 relative overflow-hidden animate-fadeIn text-slate-100 max-h-[92vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-white/20 flex-shrink-0">
              {isMasterAdmin ? (
                <span className="text-xl">👑</span>
              ) : isAdmin ? (
                <Shield className="w-6 h-6 text-amber-300" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  About Me & Profile Hub
                </h2>
                {isMasterAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    👑 Master Admin
                  </span>
                ) : isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase">
                    🛡️ Authorized Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                    ✓ Verified Citizen
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your verified account credentials, emergency contacts, and defense identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* First Time Registration Welcome Banner */}
        {isFirstTimeWelcome && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-300">
                🎉 Account Successfully Registered & Verified!
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Welcome to CivicRelief. Your primary Gmail is now registered. Review your details below, configure your emergency contact, or update your password.
              </p>
            </div>
          </div>
        )}

        {/* Notification Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 flex-shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'details'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile & Emergency Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & Change Password
          </button>
          <button
            onClick={() => setActiveTab('id_card')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'id_card'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Civic ID Badge
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 text-xs">
          {/* TAB 1: Profile & Emergency Details */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Permanent Locked Gmail Notice */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Registered Primary Gmail (Permanent & Verified)
                  </label>
                  <div className="font-mono font-bold text-white text-sm">
                    {currentUser.email}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold self-start sm:self-center">
                  <Lock className="w-3 h-3" />
                  <span>Locked for Security</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name / Identity:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Samar Sharma"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Phone Number:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 9317230299"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Civic Role */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Civic Role & Specialization:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="resident" className="bg-slate-900 text-white">Civilian Resident</option>
                    <option value="volunteer" className="bg-slate-900 text-white">Community Guardian / Volunteer</option>
                    <option value="medical" className="bg-slate-900 text-white">Medical / First Responder</option>
                    <option value="coordinator" className="bg-slate-900 text-white">Emergency Coordinator</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Blood Group (for First Responders):
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-rose-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="O+" className="bg-slate-900 text-white">O Positive (O+)</option>
                      <option value="O-" className="bg-slate-900 text-white">O Negative (O-)</option>
                      <option value="A+" className="bg-slate-900 text-white">A Positive (A+)</option>
                      <option value="A-" className="bg-slate-900 text-white">A Negative (A-)</option>
                      <option value="B+" className="bg-slate-900 text-white">B Positive (B+)</option>
                      <option value="B-" className="bg-slate-900 text-white">B Negative (B-)</option>
                      <option value="AB+" className="bg-slate-900 text-white">AB Positive (AB+)</option>
                      <option value="AB-" className="bg-slate-900 text-white">AB Negative (AB-)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts Section */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Trusted Emergency Contact (Notified during SOS)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Contact Name / Relation:
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Parent, Spouse, Local Guardian"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Emergency Phone:
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Sector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Home Neighborhood / Sector / Address:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sector 4, Civic Basin Ridge"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Bio & Skills */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Civilian Bio / Rescue Skills:
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Certified in CPR, 4x4 Offroad vehicle equipped, volunteer ham radio operator."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" /> Account Security Status
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Active & Authenticated
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your identity is cryptographically tied to <strong>{currentUser.email}</strong>. You can change your password below at any time to keep your account safe.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" /> Change Account Password
                </h3>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                    New Password (min 6 characters):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-3 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>{isChangingPass ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Civic ID Badge */}
          {activeTab === 'id_card' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1124] to-slate-950 border-2 border-white/15 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                      CR
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                        CivicRelief Emergency Net
                      </h4>
                      <p className="text-[9px] text-slate-400">Universal Defense Credential</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">
                    ACTIVE DEFENDER
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Holder Name</span>
                    <p className="font-extrabold text-white text-sm">{currentUser.displayName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Verified Gmail</span>
                    <p className="font-mono text-slate-300 text-xs truncate">{currentUser.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Civic Role</span>
                    <p className="font-semibold text-blue-300 capitalize">{currentUser.role || 'Resident'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Emergency Phone</span>
                    <p className="font-mono text-slate-300 text-xs">{currentUser.phoneNumber || 'Registered'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Blood Group</span>
                    <p className="font-bold text-rose-400">{bloodGroup}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">System ID</span>
                    <p className="font-mono text-[10px] text-slate-400 truncate">{currentUser.uid}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span>✓ Authenticated via Secure Firebase Cloud</span>
                  <span>Safety Network ID</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            Civic Protection Status: <strong className="text-emerald-400">Verified</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
