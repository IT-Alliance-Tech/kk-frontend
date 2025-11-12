// kk-frontend/app/auth/verify/page.tsx
import { redirect } from "next/navigation";

export default function AuthVerifyRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const qs = new URLSearchParams(searchParams || {}).toString();
  redirect(`/verify${qs ? "?" + qs : ""}`);
}
