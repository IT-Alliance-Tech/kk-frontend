// kk-frontend/app/(auth)/request/page.tsx
/**
 * Request OTP Page - Server Component
 * Renders the OTP request form with purpose from search params
 */

import RequestOtpClient from './RequestOtpClient';

interface RequestOtpPageProps {
  searchParams: { purpose?: 'login' | 'signup' | 'forgot' };
}

export default function RequestOtpPage({ searchParams }: RequestOtpPageProps) {
  const purpose = searchParams.purpose || 'login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Kitchen Kettles
          </h1>
          <p className="text-slate-600">
            {purpose === 'signup' ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>
        
        <RequestOtpClient purpose={purpose} />
      </div>
    </div>
  );
}
