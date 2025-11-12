/**
 * Login Page - Server Component
 * Renders the OTP-based login flow (redirects to request page)
 */

import RequestOtpClient from '../request/RequestOtpClient';

interface LoginPageProps {
  searchParams: { redirect?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams.redirect || '/orders';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Kitchen Kettles
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Sign in to your account
          </p>
        </div>
        
        <RequestOtpClient purpose="login" />
        
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
      </div>
    </div>
  );
}
