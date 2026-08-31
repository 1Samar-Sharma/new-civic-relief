import React from 'react';
import {
  ShieldAlert,
  Scale,
  Gavel,
  AlertTriangle,
  CheckCircle,
  Lock,
  UserCheck,
  Award,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { PUBLIC_COMMAND_NAME, PUBLIC_HELPLINE_EMAIL, PUBLIC_HELPLINE_PHONE } from '../../lib/firebase';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050810]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#080d1a] border-2 border-red-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-red-950/60 space-y-6 animate-fadeIn text-slate-100 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-white/20 flex-shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  CIVIC PROTOCOL & LEGAL RULES
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-extrabold uppercase tracking-wider">
                  Mandatory Notice
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Public Safety & Emergency Dispatch Compliance Guidelines
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

        {/* Primary User-Mandated Legal Warning Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/80 via-red-900/40 to-black border-2 border-red-500/80 text-red-100 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider">
            <Gavel className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>CRITICAL WARNING ON FALSE REPORTING:</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed italic bg-black/40 p-3 rounded-xl border border-red-500/30">
            "If any false thing or fraudulent emergency is posted, fines and punishment will be rewarded as a beautiful gift by society, volunteers, and the government."
          </p>
          <p className="text-[11px] text-red-200/90 leading-relaxed pt-1">
            Fabricating emergencies, creating fake SOS beacons, or posting false disaster warnings diverts ambulances, fire trucks, and civilian volunteers away from genuine life-or-death crises. Violators face immediate statutory fines, criminal prosecution, and civil liabilities.
          </p>
        </div>

        {/* Core Operational Rules Grid */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Key Platform Regulations & Permissions:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Rule 1: Author & Admin Exclusivity */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-xs">1. Author & Admin Resolution Only</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Only the person who originally posted an emergency, SOS beacon, or help request—or designated {PUBLIC_COMMAND_NAME} / authorized system admins—can mark it safe or close it. No random user can tamper with someone else's incident.
              </p>
            </div>

            {/* Rule 2: Mandatory Authentication */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-xs">2. Mandatory Identity Verification</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All participants must authenticate with valid credentials. Every broadcast, SOS ping, and mutual aid post is cryptographically logged with user identity to ensure transparent civic accountability.
              </p>
            </div>

            {/* Rule 3: Duty to Mark Safe Promptly */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-white text-xs">3. Obligation to Update Status</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Once safety is achieved or assistance is delivered, the requester or guardian must promptly mark the situation "Safe / Resolved" to release responder attention for active emergencies in the area.
              </p>
            </div>

            {/* Rule 4: Volunteer Protection */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-white text-xs">4. Good Samaritan Protection</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Volunteers and medical responders risk their safety in good faith. Harassment or abuse of emergency dispatch channels will result in immediate permanent blacklisting and legal escalation.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Control Desk & Helpline Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Emergency Response & Support Desk:
            </span>
            <p className="font-bold text-white text-sm">{PUBLIC_COMMAND_NAME}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-red-400" /> {PUBLIC_HELPLINE_EMAIL}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> {PUBLIC_HELPLINE_PHONE}
              </span>
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            Universal 24/7 Crisis Helpline & Coordination
          </div>
        </div>

        {/* Acknowledge Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> I Understand & Agree to All Civic Rules
          </button>
        </div>
      </div>
    </div>
  );
};
