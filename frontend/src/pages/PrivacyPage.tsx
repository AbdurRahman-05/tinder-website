import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white font-['Outfit']">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: September 2026</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Protection of Date of Birth</h2>
        <p>
          We require your date of birth solely to verify legal adult age (18+). We never expose your full date of birth publicly. Only your calculated age is displayed on your public profile.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Contact Link Privacy</h2>
        <p>
          WhatsApp numbers and Instagram handles are strictly optional. We provide per-field privacy toggle switches so you decide whether your contact buttons are visible to discovery visitors.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Symmetric Blocking</h2>
        <p>
          When you block another user or profile, our database symmetrically hides your profile from their search results and prevents them from viewing your profile page.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">4. Account Deletion & Right to Be Forgotten</h2>
        <p>
          You may permanently delete your profile and account at any time directly through your dashboard. All public profile traces are immediately removed from discovery.
        </p>
      </div>
    </div>
  );
};
