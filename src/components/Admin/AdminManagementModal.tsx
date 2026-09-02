import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Crown,
  Key,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_NAME, MASTER_ADMIN_PHONE, MASTER_ADMIN_PASSWORD } from '../../lib/firebase';
import { SystemAdmin } from '../../types';

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminManagementModal: React.FC<AdminManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    adminList,
    addNewAdmin,
    updateAdminPassword,
    removeAdmin,
    isMasterAdmin,
    isAdmin,
  } = useAuth();

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('AdminPass@2026');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Per-admin state for showing passwords & editing
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingAdminEmail, setEditingAdminEmail] = useState<string | null>(null);
  const [editingPasswordVal, setEditingPasswordVal] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Admin';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdminPassword(pass);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setFeedback({ type: 'error', message: 'Name and Email are required.' });
      return;
    }

    if (!newAdminPassword.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a login password for the new admin.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await addNewAdmin({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        phone: newAdminPhone.trim() || 'N/A',
        password: newAdminPassword.trim(),
      });
      setFeedback({
        type: 'success',
        message: `Successfully appointed ${newAdminName} as System Administrator with login password "${newAdminPassword}"!`,
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPassword('AdminPass@2026');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to appoint new admin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePasswordChange = async (adminEmail: string) => {
    if (!editingPasswordVal.trim()) {
      setFeedback({ type: 'error', message: 'Password cannot be blank.' });
      return;
    }
    try {
      await updateAdminPassword(adminEmail, editingPasswordVal.trim());
      setFeedback({
        type: 'success',
        message: `Updated login password for ${adminEmail} to "${editingPasswordVal.trim()}".`,
      });
      setEditingAdminEmail(null);
      setEditingPasswordVal('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update admin password.',
      });
    }
  };

  const handleCopyCredentials = (admin: SystemAdmin) => {
    const isMaster = admin.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    const pass = isMaster ? MASTER_ADMIN_PASSWORD : (admin.password || 'admin123');
    const text = `CivicRelief Admin Login\nName: ${admin.name}\nEmail: ${admin.email}\nPassword: ${pass}\nRole: ${isMaster ? 'Master Admin' : 'Appointed System Admin'}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(admin.email);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRemove = async (admin: SystemAdmin) => {
    if (admin.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      setFeedback({
        type: 'error',
        message: 'Master Administrator cannot be removed.',
      });
      return;
    }

    if (!confirm(`Are you sure you want to revoke admin privileges for ${admin.name} (${admin.email})?`)) {
      return;
    }

    try {
      await removeAdmin(admin.email);
      setFeedback({
        type: 'success',
        message: `Revoked admin privileges for ${admin.name}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to revoke admin.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#080d1a] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-amber-950/40 space-y-6 animate-fadeIn text-slate-100 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/20 flex-shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ADMIN AUTHORITY HUB
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-extrabold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage Appointed Administrators, Set Passwords & Emergency Resolution Privileges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* Status Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              Administrator Oversight & Credential Authority
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Master Admin <strong>{MASTER_ADMIN_NAME}</strong> has universal authority. You can appoint new administrators below and <strong>set the specific login password</strong> they will use to sign in and exercise emergency resolution powers.
            </p>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/20 border border-red-500/40 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Add New Admin Form */}
        <form onSubmit={handleAddAdmin} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" /> Appoint New System Administrator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Admin Full Name:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Officer Vikram Singh"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Admin Gmail / Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. vikram.admin@civicrelief.org"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Contact Phone:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> Set Login Password:
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Random
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="e.g. SecretAdmin2026!"
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Appointing Admin...' : 'Appoint as System Administrator with Assigned Password'}</span>
          </button>
        </form>

        {/* Current Active Admins List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-slate-400">
              Active Authorized Administrators ({adminList.length}):
            </h3>
            <span className="text-[10px] text-slate-500">Live Synced from Firestore</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {adminList.map((admin) => {
              const isMaster = admin.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
              const isVisible = visiblePasswords[admin.email] || false;
              const isEditing = editingAdminEmail === admin.email;
              const adminPassword = isMaster ? MASTER_ADMIN_PASSWORD : (admin.password || 'admin123');

              return (
                <div
                  key={admin.id || admin.email}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isMaster
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 ${
                        isMaster
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-white/10 text-slate-200'
                      }`}
                    >
                      {isMaster ? '👑' : <Shield className="w-4 h-4 text-slate-300" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{admin.name}</span>
                        {isMaster ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
                            Master Admin (System Lead)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold uppercase">
                            Appointed Admin
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {admin.email}
                        </span>
                        {admin.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {admin.phone}
                          </span>
                        )}
                      </div>

                      {/* Password Badge & Controls */}
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-200 flex items-center gap-1.5">
                          <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="text-slate-400 font-sans text-[10px]">Password:</span>
                          <span className="text-amber-200 font-bold">
                            {isVisible ? adminPassword : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(admin.email)}
                            className="text-slate-400 hover:text-white ml-1"
                            title={isVisible ? 'Hide' : 'Show'}
                          >
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Edit password for appointed admins */}
                        {!isMaster && (
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingAdminEmail(null);
                              } else {
                                setEditingAdminEmail(admin.email);
                                setEditingPasswordVal(admin.password || 'admin123');
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-semibold flex items-center gap-1 transition-all"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>{isEditing ? 'Cancel' : 'Change Password'}</span>
                          </button>
                        )}
                      </div>

                      {/* Inline password editor */}
                      {isEditing && (
                        <div className="pt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingPasswordVal}
                            onChange={(e) => setEditingPasswordVal(e.target.value)}
                            placeholder="New password"
                            className="px-2.5 py-1 rounded-lg bg-white/10 border border-amber-500/40 text-amber-200 text-xs font-mono focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePasswordChange(admin.email)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions right side */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyCredentials(admin)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                      title="Copy Login Credentials to send to this Admin"
                    >
                      {copiedId === admin.email ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[10px] font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px]">Copy Login</span>
                        </>
                      )}
                    </button>

                    {!isMaster && (
                      <button
                        onClick={() => handleRemove(admin)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all text-xs"
                        title="Revoke Admin Privileges"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs border border-white/10 transition-all"
          >
            Close Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

