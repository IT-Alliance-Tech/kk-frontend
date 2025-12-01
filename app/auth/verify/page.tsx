// kk-frontend/app/auth/verify/page.tsx
import { redirect } from "next/navigation";

export default async function AuthVerifyRedirect({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = searchParams ? await searchParams : {};
  const qs = new URLSearchParams(params).toString();
  redirect(`/verify${qs ? "?" + qs : ""}`);
}
