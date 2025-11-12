// kk-frontend/app/(auth)/verify/page.tsx
/**
 * Verify OTP Page - Server Component
 * Renders the OTP verification form with email, purpose, and redirect from search params
 */

import VerifyOtpClient from './VerifyOtpClient';

interface VerifyOtpPageProps {
  searchParams: {
    email?: string;
    purpose?: 'login' | 'signup' | 'forgot';
    redirectTo?: string;
  };
}

export default function VerifyOtpPage({ searchParams }: VerifyOtpPageProps) {
  const email = searchParams.email || '';
  const purpose = searchParams.purpose || 'login';
  const redirectTo = searchParams.redirectTo;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Kitchen Kettles
          </h1>
          <p className="text-slate-600">
            Enter the OTP sent to your email
          </p>
        </div>
        
        <VerifyOtpClient 
          email={email} 
          purpose={purpose} 
          redirectTo={redirectTo} 
        />
      </div>
    </div>
  );
}
