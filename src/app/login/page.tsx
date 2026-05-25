import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { env } from "@/lib/env";
import { getCurrentContext } from "@/lib/auth/session";

export default async function LoginPage() {
  if (env.isSupabaseConfigured) {
    const { user, profile } = await getCurrentContext();
    if (user) {
      redirect(profile?.organization_id ? "/dashboard" : "/setup");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-black text-white">
            GZ
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-700">
            Gadget Zone
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Online POS</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to your account, or create the first owner account during initial setup.
          </p>
        </div>
        {!env.isSupabaseConfigured && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            Supabase is not configured yet. Add credentials to <code>.env.local</code>.
          </p>
        )}
        <LoginForm />
      </section>
    </main>
  );
}
