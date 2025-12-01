// kk-frontend/app/auth/request/page.tsx
import { redirect } from "next/navigation";

export default async function AuthRequestRedirect({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = searchParams ? await searchParams : {};
  const qs = new URLSearchParams(params).toString();
  redirect(`/request${qs ? "?" + qs : ""}`);
}
