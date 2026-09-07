import React, { useState } from 'react';
import { api } from '../api/client';
import { ReportReason } from '../types';
import { AlertTriangle, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  profileId: string;
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'HARASSMENT', label: 'Harassment or Bullying', desc: 'Threats, hateful speech, or targeted hostility.' },
  { value: 'FAKE_PROFILE', label: 'Fake Profile / Catfish', desc: 'Misrepresenting identity or stolen pictures.' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content', desc: 'Explicit, illegal, or non-consensual material.' },
  { value: 'SPAM', label: 'Spam or Commercial Promo', desc: 'Selling products, unsolicited crypto, or bot behavior.' },
  { value: 'SCAM', label: 'Scam or Financial Fraud', desc: 'Asking for money, gift cards, or financial details.' },
  { value: 'IMPERSONATION', label: 'Impersonation', desc: 'Pretending to be someone else without permission.' },
  { value: 'OFFENSIVE_CONTENT', label: 'Offensive or Discriminatory', desc: 'Discriminatory content against LGBTQ+ community.' },
  { value: 'OTHER', label: 'Other Concern', desc: 'Any other safety or platform guideline violation.' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ profileId, profileName, isOpen, onClose }) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason>('HARASSMENT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/interactions/${profileId}/report`, {
        reason: selectedReason,
        description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-card border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Report Submitted</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping PRISM safe. Our moderation team reviews every report and takes appropriate action under 24 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Profile</h3>
                <p className="text-xs text-slate-400">Reporting {profileName} for safety review</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Reason
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    onClick={() => setSelectedReason(r.value)}
                    className={`block p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === r.value
                        ? 'bg-purple-600/20 border-purple-500/60 text-purple-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{r.label}</span>
                      <input
                        type="radio"
                        name="reason"
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Please describe what happened or why this profile violates community guidelines..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-md shadow-rose-600/20 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
