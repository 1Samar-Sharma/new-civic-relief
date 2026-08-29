import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Shield,
  Flame,
  Waves,
  HeartPulse,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [disasterType, setDisasterType] = useState('Wildfire & Smoke');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'ai'; text: string; timestamp: string; isFallback?: boolean }[]
  >([
    {
      sender: 'ai',
      text: `### 🛡️ CivicRelief Emergency AI Triage Advisor
I provide **immediate, real-time crisis survival guidance**, first-aid steps, evacuation checklists, and safety protocols.

How can I assist your safety right now? Tap a quick scenario below or ask any question.`,
      timestamp: 'Just now',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: '🔥 Wildfire within 2km',
      prompt: 'A wildfire is 2.5km away and smoke is heavy. What immediate steps must I take before official evacuation?',
      type: 'Wildfire',
    },
    {
      label: '🚨 Being Followed (Women Safety)',
      prompt: 'I feel followed in a poorly lit street by 2 people. Give me discreet immediate de-escalation and safe haven steps.',
      type: 'Women Safety',
    },
    {
      label: '🌊 Flood Water Rising',
      prompt: 'Water has breached my basement door and is rising rapidly. How do I evacuate safely and disconnect utilities?',
      type: 'Flood',
    },
    {
      label: '🩹 Severe Burn / Smoke Inhalation',
      prompt: 'Emergency first-aid for a neighbor with 2nd-degree burn on forearm and smoke inhalation coughing.',
      type: 'Medical First-Aid',
    },
  ];

  const handleSend = async (textToSend?: string, typeToUse?: string) => {
    const message = textToSend || query;
    if (!message.trim()) return;

    const chosenType = typeToUse || disasterType;

    const userMsg = {
      sender: 'user' as const,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          disasterType: chosenType,
          location: 'Foothills & Valley Zone',
          userRole: 'Community Resident',
        }),
      });

      const data = await response.json();
      const aiMsg = {
        sender: 'ai' as const,
        text: data.answer || 'Follow standard emergency procedures.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai' as const,
          text: `### 🛡️ Emergency Triage Standby
1. Check immediate life safety and apply pressure to bleeding.
2. Dial 911 / National Emergency hotline if in direct danger.
3. Broadcast your need on the CivicRelief Mutual Aid board for nearby neighbor dispatch.`,
          timestamp: 'Just now',
          isFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-[#050810]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[85vh] max-h-[700px] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  AI Emergency Crisis & Triage Advisor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/40 font-bold">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Immediate lifesaving guidance, first-aid steps & evacuation protocols
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Quick Scenario Chips */}
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold uppercase text-[9px] flex-shrink-0">
            Quick Prompts:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp.prompt, qp.type)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 border border-white/10 hover:border-purple-500/40 whitespace-nowrap transition-all flex-shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-600/20'
                    : 'bg-white/[0.04] backdrop-blur-xl border border-white/10 text-slate-200 rounded-bl-none shadow-lg space-y-1'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-purple-200' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-purple-300 text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Gemini is generating lifesaving triage protocol...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about burn care, flood evacuation, smoke protection, de-escalation..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all disabled:opacity-40 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
