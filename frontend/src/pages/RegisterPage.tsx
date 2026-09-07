import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateOfBirth(val);
    if (!val) {
      setCalculatedAge(null);
      return;
    }
    const dob = new Date(val);
    if (!isNaN(dob.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      setCalculatedAge(age);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (calculatedAge === null || calculatedAge < 18) {
      setError('You must be at least 18 years old to join PRISM.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the Community Guidelines and Terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        dateOfBirth,
        termsAccepted,
      });
      navigate('/create-profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-rose-400 p-[2px] shadow-lg shadow-purple-600/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Join the inclusive, verified community. Strictly for adults (18+).
          </p>
        </div>

        {/* Card Form */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Date of Birth / 18+ check */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
                {calculatedAge !== null && (
                  <span
                    className={`text-[11px] font-semibold ${
                      calculatedAge >= 18 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Age: {calculatedAge} {calculatedAge >= 18 ? '✓ (18+ Verified)' : '✗ (Must be 18+)'}
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={handleDobChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500">
                🔒 Full birth date is never shown publicly. Only your calculated age is displayed.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters with uppercase & number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I confirm that I am at least 18 years old and agree to the{' '}
                  <Link to="/terms" className="text-purple-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/safety" className="text-purple-400 hover:underline">
                    Community Safety Guidelines
                  </Link>
                  .
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || (calculatedAge !== null && calculatedAge < 18)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Continue to Profile Setup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              Log in
            </Link>
          </div>
        </div>

        {/* Guest Alternative */}
        <div className="text-center">
          <Link to="/discover" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Just exploring? Continue as Guest →
          </Link>
        </div>
      </div>
    </div>
  );
};
