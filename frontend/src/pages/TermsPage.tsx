import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white font-['Outfit']">Terms of Service</h1>
        <p className="text-xs text-slate-500">Effective Date: September 2026</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Age Requirement (18+)</h2>
        <p>
          You must be at least 18 years old to access or create an account on PRISM. By registering, you warrant that you are of legal adult age. Providing a false birth date is a material violation of these Terms.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Community Conduct</h2>
        <p>
          You agree not to post abusive, hateful, defamatory, or unlawful material. Harassment of any nature toward LGBTQ+ individuals, misgendering, or predatory behavior will result in permanent account termination.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Public Profiles & Social Links</h2>
        <p>
          You acknowledge that public profiles are discoverable by guests and registered users. You maintain full control over WhatsApp and Instagram link visibility and can toggle them private at any time.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">4. Account Termination & Moderation</h2>
        <p>
          PRISM administration reserves the right to suspend or block profiles that violate community safety or receive substantiated abuse reports.
        </p>
      </div>
    </div>
  );
};
