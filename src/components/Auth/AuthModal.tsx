import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MASTER_ADMIN_EMAIL, MASTER_ADMIN_NAME, MASTER_ADMIN_PHONE } from '../../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  canDismiss = false,
}) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    setIsRulesModalOpen,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'resident' | 'volunteer' | 'coordinator' | 'medical'>('resident');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen && currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your registered email and password.');
        }
        await loginWithEmail(email.trim(), password);
      } else {
        if (!email.trim() || !password || !name.trim()) {
          throw new Error('Please fill in your full name, email, and password.');
        }
        await signupWithEmail(email.trim(), password, name.trim(), phone.trim(), role);
      }
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Google verification could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const setMasterAdminPreset = () => {
    setMode('signin');
    setEmail(MASTER_ADMIN_EMAIL);
    setPassword('');
    setError('Master Admin detected. Please enter Samar Sharma\'s master admin password.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#080d1a] border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/80 space-y-5 relative overflow-hidden animate-fadeIn text-slate-100">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-white/20 flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  CIVIC<span className="text-red-500">RELIEF</span> AUTH
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase tracking-wider">
                  Verified Identity
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified Emergency Management & Public Safety Defense Net
              </p>
            </div>
          </div>

          {canDismiss && onClose && currentUser && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Google One-Click Official Auth Banner */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-white/20 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Verified Google Account</span>
        </button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#080d1a] px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Or Use Email & Password
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Profile
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name / Civilian Call Sign:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samar Sharma / Alex Doe"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Contact Phone Number:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9317230299"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Your Primary Civic Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="resident" className="bg-slate-900 text-white">Civilian Resident</option>
                    <option value="volunteer" className="bg-slate-900 text-white">Community Guardian / Volunteer</option>
                    <option value="medical" className="bg-slate-900 text-white">Medical / First Responder</option>
                    <option value="coordinator" className="bg-slate-900 text-white">Emergency Coordinator</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Registered Gmail / Email Address:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Password:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-[10px] text-slate-400 mt-1">
                Must be at least 6 characters. You can update this password later in your About/Profile section.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In with Password</span> <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Register Verified Account</span> <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Master Admin Fast Preset */}
        <div className="pt-2">
          <button
            type="button"
            onClick={setMasterAdminPreset}
            className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-left transition-all flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">👑</span>
              <div>
                <span className="font-bold text-amber-300">Master Admin Authority Access</span>
                <p className="text-[10px] text-slate-400">Chief Executive Command Portal</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
              Enter Key
            </span>
          </button>
        </div>

        {/* Footer Rules link */}
        <div className="pt-2 text-center border-t border-white/10 text-[11px] text-slate-400">
          By signing in, you agree to the{' '}
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="text-red-400 font-bold underline hover:text-red-300 ml-1"
          >
            Civic Rules & False-Alarm Penalties
          </button>
        </div>
      </div>
    </div>
  );
};
