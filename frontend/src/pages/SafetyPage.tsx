import React from 'react';
import { ShieldCheck, Heart, AlertTriangle, PhoneCall, Lock, Flag } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
          Safety & Community Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          PRISM is built on radical inclusivity, affirmative consent, mutual respect, and zero tolerance for bigotry or harassment.
        </p>
      </div>

      {/* 18+ Notice */}
      <div className="p-6 rounded-3xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-4">
        <Lock className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Strictly 18+ Platform</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All users must verify they are at least 18 years of age during registration. PRISM is intended exclusively for adults. We actively remove and report any underage accounts.
          </p>
        </div>
      </div>

      {/* Community Values */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Our Non-Negotiable Standards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-pink-400">Respect Names & Pronouns</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intentional misgendering, deadnaming, or mocking gender identities is strictly prohibited and leads to immediate account suspension.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-emerald-400">Affirmative Consent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connecting on WhatsApp or Instagram does not mean consent for unsolicited explicit media. Respect boundaries and keep interactions consensual.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-purple-400">Zero Bigotry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Racism, transphobia, homophobia, biphobia, ableism, body shaming, and hate speech of any kind are met with zero-tolerance bans.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-400">No Commercial Spam or Scams</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Using PRISM to promote crypto, sell products, solicit funds, or engage in catfish scams is strictly disallowed.
            </p>
          </div>
        </div>
      </div>

      {/* In-Person Meeting Safety */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          <span>Real-World Safety Tips</span>
        </h2>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li><strong>Meet in Public:</strong> Always arrange first in-person meetings in well-lit, populated public venues like queer-friendly cafes.</li>
          <li><strong>Tell a Friend:</strong> Share your location, who you are meeting, and an agreed check-in time with a trusted friend.</li>
          <li><strong>Protect Financial Info:</strong> Never send money, gift cards, or financial credentials to anyone online.</li>
          <li><strong>Stay in Control:</strong> Have your own transportation arranged so you can leave whenever you feel uncomfortable.</li>
        </ul>
      </div>

      {/* Hotlines */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-purple-400" />
          <span>24/7 Confidential LGBTQ+ Support</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-white block">The Trevor Project</span>
            <span className="text-purple-400 font-semibold block mt-1">1-866-488-7386</span>
            <span className="text-slate-500 text-[11px]">Crisis intervention for LGBTQ youth & young adults</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-white block">Trans Lifeline</span>
            <span className="text-pink-400 font-semibold block mt-1">1-877-565-8860</span>
            <span className="text-slate-500 text-[11px]">Peer support run by and for trans individuals</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-white block">LGBT National Hotline</span>
            <span className="text-cyan-400 font-semibold block mt-1">1-888-843-4564</span>
            <span className="text-slate-500 text-[11px]">All-ages peer counseling and resources</span>
          </div>
        </div>
      </div>
    </div>
  );
};
