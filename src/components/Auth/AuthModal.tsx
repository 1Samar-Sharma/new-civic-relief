import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  HeartPulse,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    quickDemoLogin,
    setIsRulesModalOpen,
  } = useAuth();

  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  // Profile Details for Email Registration
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'resident' | 'volunteer' | 'coordinator' | 'medical'>('resident');

  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    // Only allow dismissal if user has an active authenticated session
    if (!currentUser) {
      return;
    }
    if (canDismiss && onClose) {
      onClose();
    }
  };

  // Email: Sign In / Sign Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (emailMode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }
        await loginWithEmail(email.trim(), password);
      } else {
        if (!email.trim() || !password || !name.trim()) {
          throw new Error('Please fill in your full name, email, and password.');
        }
        await signupWithEmail(email.trim(), password, name.trim(), phoneNumber.trim() || undefined, role);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials or create an account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In with real authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle(email.trim() || undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#080d1a] border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/80 space-y-4 relative overflow-hidden animate-fadeIn text-slate-100 my-auto">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 border border-white/20 flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  CIVIC<span className="text-red-500">RELIEF</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase tracking-wider">
                  Secure Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Emergency Response & Civilian Defense Network
              </p>
            </div>
          </div>

          {canDismiss && currentUser ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close auth modal"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all text-xs border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              <span>Login Required</span>
            </div>
          )}
        </div>

        {/* Mandatory Authentication Notice */}
        {!currentUser && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600/15 via-rose-600/10 to-amber-600/10 border border-red-500/30 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-200">Mandatory Login: </span>
              <span className="text-slate-300">
                Please sign in with your Google account or registered credentials to access emergency radar, SOS broadcasts, and live disaster relief.
              </span>
            </div>
          </div>
        )}

        {/* Google Authentication (Primary 1-Click Secure Method) */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
          <span>Continue with Google Account</span>
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            or sign in with password
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Mode Switcher: Sign In vs Sign Up */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              setEmailMode('signin');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              emailMode === 'signin'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setEmailMode('signup');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              emailMode === 'signup'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
          {emailMode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name / Call Sign:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Primary Civic Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('resident')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      role === 'resident'
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-bold block text-[11px]">Resident</span>
                      <span className="text-[9px] text-slate-400">Civilian member</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('volunteer')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      role === 'volunteer'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold block text-[11px]">Guardian</span>
                      <span className="text-[9px] text-slate-400">Aid responder</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. resident@civicrelief.org"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 text-xs"
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
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : emailMode === 'signin' ? (
              <>
                <span>Sign In with Password</span> <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create & Enter Platform</span> <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Civilian Demo Role Exploration */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Explore Demo Roles (Civilian/Volunteer):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('volunteer');
                handleClose();
              }}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Guardian</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Volunteer</p>
            </button>

            <button
              type="button"
              onClick={() => {
                quickDemoLogin('medical');
                handleClose();
              }}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Medical</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Responder</p>
            </button>

            <button
              type="button"
              onClick={() => {
                quickDemoLogin('resident');
                handleClose();
              }}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                <Users className="w-3.5 h-3.5" />
                <span>Resident</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Civilian</p>
            </button>
          </div>
        </div>

        {/* Footer Rules link */}
        <div className="pt-1.5 text-center border-t border-white/10 text-[11px] text-slate-400">
          By authenticating, you agree to the{' '}
          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="text-red-400 font-bold underline hover:text-red-300 ml-1"
          >
            Civic Rules & Penalties
          </button>
        </div>
      </div>
    </div>
  );
};
