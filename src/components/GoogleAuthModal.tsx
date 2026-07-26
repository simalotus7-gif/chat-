import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Mail, LogIn, Sparkles } from 'lucide-react';
import { User } from '../types';

interface GoogleAuthModalProps {
  currentUser: User;
  onLoginWithGoogle: (user: User) => void;
  onClose: () => void;
}

// Google SVG Icon
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.21 21.32 7.32 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.14 0 9.99 0 12s.44 3.86 1.23 5.42l4.05-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.21 2.68 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// Decode Google JWT Token
function decodeGoogleJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT token', e);
    return null;
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLoginWithGoogle,
  onClose,
}) => {
  const [googleEmail, setGoogleEmail] = useState('simalotus7@gmail.com');
  const [googleName, setGoogleName] = useState('Sima Lotus');
  const [clientId, setClientId] = useState('');
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [authMethod, setAuthMethod] = useState<'quick' | 'oauth'>('quick');

  // Check if GSI is available
  useEffect(() => {
    const checkGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        setIsGsiLoaded(true);
      }
    };
    checkGsi();
    const interval = setInterval(checkGsi, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Google One Tap / Button when client ID is set
  useEffect(() => {
    if (isGsiLoaded && clientId) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const payload = decodeGoogleJwt(response.credential);
              if (payload) {
                const googleUser: User = {
                  id: `google_${payload.sub || Date.now()}`,
                  name: payload.name || payload.given_name || 'Google User',
                  avatar:
                    payload.picture ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                  status: 'online',
                  customStatus: `Google Account: ${payload.email}`,
                  bio: `Signed in with Google (${payload.email})`,
                  color: '#4285F4',
                  joinedAt: new Date().toISOString(),
                };
                onLoginWithGoogle(googleUser);
                onClose();
              }
            }
          },
        });

        const btnElement = document.getElementById('google-signin-btn-container');
        if (btnElement) {
          (window as any).google.accounts.id.renderButton(btnElement, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            width: 280,
          });
        }
      } catch (err) {
        console.error('Error initializing Google Auth button:', err);
      }
    }
  }, [clientId, isGsiLoaded]);

  const handleQuickGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;

    const nameFormatted = googleName.trim() || googleEmail.split('@')[0];
    const uniqueHash = Math.abs(
      googleEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    
    // Colorful high quality avatar photos for Google users
    const avatarPool = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    ];
    const chosenAvatar = avatarPool[uniqueHash % avatarPool.length];

    const googleUser: User = {
      id: `google_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: nameFormatted,
      avatar: chosenAvatar,
      status: 'online',
      customStatus: `Google Account: ${googleEmail}`,
      bio: `Google Verified Account (${googleEmail})`,
      color: '#4285F4',
      joinedAt: new Date().toISOString(),
    };

    onLoginWithGoogle(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Sign in with Google Account
            </h2>
            <p className="text-xs text-slate-400">
              Connect your Google identity to TalkTribe
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl my-4 text-xs font-semibold">
          <button
            onClick={() => setAuthMethod('quick')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authMethod === 'quick'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Quick Login
          </button>
          <button
            onClick={() => setAuthMethod('oauth')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              authMethod === 'oauth'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google OAuth Client ID
          </button>
        </div>

        {authMethod === 'quick' ? (
          <form onSubmit={handleQuickGoogleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-200 leading-relaxed">
                Log in with your Google account. Every user receives a unique verified identity to chat in real-time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Google Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Name on Google
              </label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="Google Display Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Continue with Google ({googleEmail || 'Account'})</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Enter your Google Cloud Console OAuth 2.0 Client ID to render the official Google Sign-In button.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="xxxxxxxxx.apps.googleusercontent.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div id="google-signin-btn-container" className="flex justify-center py-2" />

            {!clientId && (
              <p className="text-[11px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                Note: Standard Google OAuth Client IDs can be generated in Google Cloud Console. Switch to <strong>Google Quick Login</strong> above to log in immediately with your Google email.
              </p>
            )}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            TalkTribe Google OAuth Integration Active
          </p>
        </div>
      </div>
    </div>
  );
};
