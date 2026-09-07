import React, { useState } from 'react';
import { api } from '../api/client';
import { ShieldBan, X, AlertTriangle } from 'lucide-react';

interface BlockModalProps {
  profileId: string;
  profileName: string;
  isOpen: boolean;
  onClose: () => void;
  onBlocked: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  profileId,
  profileName,
  isOpen,
  onClose,
  onBlocked,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/interactions/${profileId}/block`);
      onBlocked();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to block profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl glass-card border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldBan className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Block {profileName}?</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              When you block this profile, neither of you will see each other in discovery results or be able to interact.
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-md shadow-rose-600/20 transition-all"
            >
              {isSubmitting ? 'Blocking...' : 'Block Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
