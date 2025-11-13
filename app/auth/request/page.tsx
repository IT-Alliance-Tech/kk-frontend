// kk-frontend/app/auth/request/page.tsx
import { redirect } from "next/navigation";

export default function AuthRequestRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const qs = new URLSearchParams(searchParams || {}).toString();
  redirect(`/request${qs ? "?" + qs : ""}`);
}
