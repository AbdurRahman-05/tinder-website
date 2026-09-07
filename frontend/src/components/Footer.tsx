import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-['Outfit']">PRISM</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A modern, inclusive, LGBTQ+ friendly discovery platform designed for discovering and connecting with genuine people.
            </p>
            <div className="flex items-center space-x-2 text-xs text-purple-400 font-medium">
              <Heart className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              <span>Safe, welcoming & 18+ compliant</span>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-purple-300 transition-colors">
                  Explore Profiles
                </Link>
              </li>
              <li>
                <Link to="/discover?gender=Non-binary" className="hover:text-purple-300 transition-colors">
                  Non-binary Voices
                </Link>
              </li>
              <li>
                <Link to="/discover?gender=Trans+woman" className="hover:text-purple-300 transition-colors">
                  Trans Community
                </Link>
              </li>
              <li>
                <Link to="/discover?lookingFor=Friendship" className="hover:text-purple-300 transition-colors">
                  Find Friends
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Safety & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-purple-300 transition-colors flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Safety Hub & Guidelines</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-purple-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-300 transition-colors">
                  Privacy Policy & Controls
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Moderation Response &lt; 24h</span>
              </li>
            </ul>
          </div>

          {/* LGBTQ+ Resources */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Crisis & Support</h4>
            <p className="text-xs text-slate-400 mb-2">
              If you or a friend ever need support, confidential community help is available 24/7:
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="text-purple-300">
                <span className="font-semibold text-white">The Trevor Project:</span> 1-866-488-7386
              </li>
              <li className="text-pink-300">
                <span className="font-semibold text-white">Trans Lifeline:</span> 1-877-565-8860
              </li>
              <li className="text-cyan-300">
                <span className="font-semibold text-white">LGBT National Help:</span> 1-888-843-4564
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} PRISM Platform. Strictly for adults (18+). All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/safety" className="hover:text-slate-300">Safety</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/admin/login" className="text-slate-400 hover:text-purple-400">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
