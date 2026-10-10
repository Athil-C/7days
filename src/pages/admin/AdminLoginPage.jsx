import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SHOP_FULL_NAME, SHOP_SUBTITLE } from '../../data/config';
import { Lock, Mail, ArrowRight, Store, AlertCircle } from 'lucide-react';
import { recordAdminLogin } from '../../services/adminLogService';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  // Check if session was terminated remotely
  const isTerminated = new URLSearchParams(location.search).get('terminated') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Login failed. Please verify credentials.');
      } else {
        // Record login with automatic hardware, IP, and location fingerprinting (no manual name spoofing)
        await recordAdminLogin(email, 'Super Admin');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unexpected login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FFB703]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-96 h-96 rounded-full bg-[#FB8500]/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FB8500] to-[#FFB703] text-white shadow-lg shadow-[#FB8500]/25 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#263238] tracking-tight">
            {SHOP_FULL_NAME}
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#FB8500] tracking-wider uppercase">
            {SHOP_SUBTITLE} • Admin Portal
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage catalog products, photos, and descriptions
          </p>
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-xl shadow-[#263238]/5 rounded-2xl border border-[#263238]/10 sm:px-10">
          {isTerminated && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Session Disconnected</strong>
                <span>This device's session was remotely terminated by the Super Administrator.</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Admin Email
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@7daystoys.com"
                  className="block w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FB8500] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#FB8500] hover:bg-[#e07500] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB8500] disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#FB8500] transition-colors"
            >
              <Store className="w-4 h-4" />
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
