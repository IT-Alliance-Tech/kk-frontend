// kk-frontend/app/(auth)/request/RequestOtpClient.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { requestOtp } from '@/lib/api/auth.api';

interface RequestOtpClientProps {
  purpose: 'login' | 'signup' | 'forgot';
}

export default function RequestOtpClient({ purpose }: RequestOtpClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await requestOtp(email, purpose);
      setSuccess(result.message || 'OTP sent to your email!');
      
      // Navigate to verify page after brief delay
      setTimeout(() => {
        const encodedEmail = encodeURIComponent(email);
        router.push(`/auth/verify?email=${encodedEmail}&purpose=${purpose}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        {purpose === 'signup' ? (
          <p>
            Already have an account?{' '}
            <a href="/auth/request?purpose=login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{' '}
            <a href="/auth/request?purpose=signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
