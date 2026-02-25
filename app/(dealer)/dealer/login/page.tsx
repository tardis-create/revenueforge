'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DealerLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // MVP: Simple hardcoded auth (in production, this would be API call)
    if (credentials.email === 'dealer@revenueforge.io' && credentials.password === 'dealer123') {
      localStorage.setItem('dealerAuth', JSON.stringify({ email: credentials.email, name: 'Dealer Partner' }));
      router.push('/dealer');
    } else {
      setError('Invalid credentials. Use dealer@revenueforge.io / dealer123');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">RF</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Dealer Portal</h1>
          <p className="text-zinc-600 mt-2">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                placeholder="dealer@revenueforge.io"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs text-zinc-600 font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-zinc-500">
              Email: dealer@revenueforge.io<br />
              Password: dealer123
            </p>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            ← Back to RevenueForge
          </a>
        </div>
      </div>
    </div>
  );
}
